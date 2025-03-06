import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection, ConnectOptions } from 'mongoose';
import { AppLogger } from './logger.service';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000; // 5 seconds

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext('DatabaseService');
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        this.logger.debug('Database is already connected');
        return;
      }

      const uri = this.configService.get<string>('MONGODB_URI');
      if (!uri) {
        throw new Error('MongoDB URI is not configured');
      }

      const options: ConnectOptions = {
        autoCreate: true,
        autoIndex: true,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        keepAlive: true,
        maxPoolSize: 10,
        minPoolSize: 2,
      };

      this.connection = await createConnection(uri, options);

      this.connection.on('connected', () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.logger.log('Successfully connected to MongoDB');
      });

      this.connection.on('disconnected', () => {
        this.isConnected = false;
        this.logger.warn('Disconnected from MongoDB');
        this.handleDisconnect();
      });

      this.connection.on('error', (error) => {
        this.logger.error('MongoDB connection error', error);
        if (this.isConnected) {
          this.handleDisconnect();
        }
      });

      await this.connection.asPromise();
      this.isConnected = true;
      this.logger.log('Successfully connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
      this.handleDisconnect();
      throw error;
    }
  }

  private async handleDisconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      );
      return;
    }

    this.reconnectAttempts++;
    this.logger.warn(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        this.logger.error('Reconnection attempt failed', error);
      }
    }, this.reconnectInterval);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.close();
        this.isConnected = false;
        this.logger.log('Disconnected from MongoDB');
      } catch (error) {
        this.logger.error('Error while disconnecting from MongoDB', error);
        throw error;
      }
    }
  }

  getConnection(): Connection {
    if (!this.isConnected) {
      throw new Error('Database is not connected');
    }
    return this.connection;
  }

  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          details: {
            error: 'Database is not connected',
            reconnectAttempts: this.reconnectAttempts,
          },
        };
      }
      
      const ping = await this.connection.db.admin().ping();
      return {
        status: 'connected',
        details: {
          ping,
          connectionState: this.connection.readyState,
          models: Object.keys(this.connection.models),
        },
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'error',
        details: {
          error: error.message,
          connectionState: this.connection?.readyState,
        },
      };
    }
  }

  async getStats(): Promise<{
    status: string;
    collections: number;
    documents: number;
    dataSize: number;
    storageSize: number;
    indexes: number;
    indexSize: number;
  }> {
    try {
      if (!this.isConnected) {
        throw new Error('Database is not connected');
      }

      const stats = await this.connection.db.stats();
      return {
        status: 'connected',
        collections: stats.collections,
        documents: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
      };
    } catch (error) {
      this.logger.error('Failed to get database stats', error);
      throw error;
    }
  }

  async dropDatabase(): Promise<void> {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Cannot drop database in production environment');
    }

    try {
      await this.connection.db.dropDatabase();
      this.logger.warn('Database dropped successfully');
    } catch (error) {
      this.logger.error('Failed to drop database', error);
      throw error;
    }
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}
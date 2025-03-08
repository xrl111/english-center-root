import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  TokenResponse,
  MessageResponse,
  ProfileResponse,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { AUTH_MESSAGES } from './constants/messages';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user and return authentication tokens',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: AUTH_MESSAGES.SUCCESS.REGISTER,
    type: TokenResponse,
  })
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponse> {
    const user = await this.authService.register(registerDto);
    return this.authService.login(user);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_MESSAGES.SUCCESS.LOGIN,
    type: TokenResponse,
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the current user profile',
    type: ProfileResponse,
  })
  async getProfile(@Req() req: any): Promise<ProfileResponse> {
    return this.authService.getUserProfile(req.user._id);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_MESSAGES.SUCCESS.TOKEN_REFRESH,
    type: TokenResponse,
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto
  ): Promise<TokenResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_MESSAGES.SUCCESS.LOGOUT,
    type: MessageResponse,
  })
  async logout(
    @Req() req: any,
    @Body() logoutDto: LogoutDto
  ): Promise<MessageResponse> {
    await this.authService.logout(req.user.id, logoutDto.refreshToken);
    return { message: AUTH_MESSAGES.SUCCESS.LOGOUT };
  }

  @Public()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET_SENT,
    type: MessageResponse,
  })
  async requestPasswordReset(
    @Body() requestResetDto: RequestPasswordResetDto
  ): Promise<MessageResponse> {
    await this.authService.requestPasswordReset(requestResetDto.email);
    return { message: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET_SENT };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET,
    type: MessageResponse,
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<MessageResponse> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );
    return { message: AUTH_MESSAGES.SUCCESS.PASSWORD_RESET };
  }
}

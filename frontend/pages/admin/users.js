import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  Box,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import useNotification from '../../hooks/useNotification';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingOverlay from '../../components/LoadingOverlay';
import useMutation from '../../hooks/useMutation';
import { formatDate } from '../../utils/dateUtils';

export default function UsersPage() {
  const [confirmAction, setConfirmAction] = useState(null);
  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();

  const { data: users, isLoading } = useQuery(['users'], async () => {
    const response = await fetch('/api/auth/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  });

  const updateRoleMutation = useMutation(
    async ({ userId, role }) => {
      const response = await fetch(`/api/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        showNotification('User role updated successfully', 'success');
        queryClient.invalidateQueries(['users']);
      },
      onError: (error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const toggleStatusMutation = useMutation(
    async ({ userId, isActive }) => {
      const response = await fetch(`/api/auth/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${isActive ? 'activate' : 'deactivate'} user`);
      }
      return response.json();
    },
    {
      onSuccess: () => {
        showNotification('User status updated successfully', 'success');
        queryClient.invalidateQueries(['users']);
      },
      onError: (error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const handleRoleChange = (userId, role) => {
    setConfirmAction({
      type: 'role',
      title: 'Change User Role',
      message: `Are you sure you want to change this user's role to ${role}?`,
      action: () => updateRoleMutation.mutate({ userId, role }),
    });
  };

  const handleToggleStatus = (user) => {
    setConfirmAction({
      type: 'status',
      title: `${user.isActive ? 'Deactivate' : 'Activate'} User`,
      message: `Are you sure you want to ${
        user.isActive ? 'deactivate' : 'activate'
      } this user?`,
      action: () =>
        toggleStatusMutation.mutate({ userId: user._id, isActive: !user.isActive }),
    });
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="instructor">Instructor</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleToggleStatus(user)}
                      color={user.isActive ? 'error' : 'success'}
                    >
                      {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {confirmAction && (
          <ConfirmDialog
            open={true}
            title={confirmAction.title}
            message={confirmAction.message}
            onConfirm={() => {
              confirmAction.action();
              setConfirmAction(null);
            }}
            onCancel={() => setConfirmAction(null)}
            isLoading={
              confirmAction.type === 'role'
                ? updateRoleMutation.isLoading
                : toggleStatusMutation.isLoading
            }
          />
        )}

        <NotificationComponent />
      </Container>
    </AdminLayout>
  );
}
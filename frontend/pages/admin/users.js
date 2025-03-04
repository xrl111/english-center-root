import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Select,
  MenuItem,
  TablePagination,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import AdminLayout from '../../components/AdminLayout';
import { withAuth } from '../../components/withAuth';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingOverlay from '../../components/LoadingOverlay';
import NoData from '../../components/NoData';
import SEO from '../../components/SEO';
import useNotification from '../../hooks/useNotification';
import useMutation from '../../hooks/useMutation';
import { formatDate } from '../../utils/dateUtils';

const ROLES = {
  admin: { label: 'Admin', color: 'error' },
  user: { label: 'User', color: 'primary' },
};

function AdminUsers() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();

  const { data: users, isLoading } = useQuery(['users'], async () => {
    const response = await fetch('/api/auth/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  });

  const updateRoleMutation = useMutation(
    async ({ userId, role }) => {
      const response = await fetch(`/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    {
      onSuccess: () => {
        showNotification('User role updated successfully', 'success');
        queryClient.invalidateQueries(['users']);
      },
    }
  );

  const toggleStatusMutation = useMutation(
    async ({ userId, isActive }) => {
      const response = await fetch(`/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    {
      onSuccess: (_, { isActive }) => {
        showNotification(
          `User ${isActive ? 'activated' : 'deactivated'} successfully`,
          'success'
        );
        queryClient.invalidateQueries(['users']);
      },
    }
  );

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRoleChange = async (user, newRole) => {
    if (user.role === 'admin' && newRole !== 'admin') {
      setSelectedUser(user);
      setConfirmAction(() => () =>
        updateRoleMutation.mutate({ userId: user._id, role: newRole })
      );
      setIsConfirmDialogOpen(true);
    } else {
      await updateRoleMutation.mutate({ userId: user._id, role: newRole });
    }
  };

  const handleToggleStatus = (user) => {
    setSelectedUser(user);
    setConfirmAction(() => () =>
      toggleStatusMutation.mutate({
        userId: user._id,
        isActive: !user.isActive,
      })
    );
    setIsConfirmDialogOpen(true);
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SEO title="Manage Users" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Manage Users
        </Typography>

        {!users?.length ? (
          <NoData message="No users found" />
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            disabled={updateRoleMutation.isLoading}
                          >
                            {Object.entries(ROLES).map(([role, { label }]) => (
                              <MenuItem key={role} value={role}>
                                {label}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color={user.isActive ? 'error' : 'success'}
                            onClick={() => handleToggleStatus(user)}
                            disabled={toggleStatusMutation.isLoading}
                          >
                            {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Paper>
        )}

        <ConfirmDialog
          open={isConfirmDialogOpen}
          title="Confirm Action"
          message={
            selectedUser?.role === 'admin'
              ? 'Are you sure you want to remove admin privileges from this user?'
              : `Are you sure you want to ${
                  selectedUser?.isActive ? 'deactivate' : 'activate'
                } this user?`
          }
          onConfirm={() => {
            confirmAction();
            setIsConfirmDialogOpen(false);
          }}
          onCancel={() => setIsConfirmDialogOpen(false)}
          isLoading={updateRoleMutation.isLoading || toggleStatusMutation.isLoading}
          severity="warning"
        />

        <NotificationComponent />
      </Box>
    </>
  );
}

// Use AdminLayout for this page
AdminUsers.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

// Export with admin authentication protection
export default withAuth(AdminUsers, { requireAdmin: true });
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Restore as RestoreIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import AdminLayout from '../../components/AdminLayout';
import { withAuth } from '../../components/withAuth';
import Calendar from '../../components/Calendar';
import FormDialog from '../../components/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingOverlay from '../../components/LoadingOverlay';
import NoData from '../../components/NoData';
import SEO from '../../components/SEO';
import useNotification from '../../hooks/useNotification';
import useMutation from '../../hooks/useMutation';
import { scheduleApi, courseApi } from '../../utils/api';
import { formatDate, formatTime } from '../../utils/dateUtils';

function AdminSchedule() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();

  const { data: schedules, isLoading: isLoadingSchedules } = useQuery(
    'schedules',
    scheduleApi.getAll
  );

  const { data: courses, isLoading: isLoadingCourses } = useQuery(
    'courses',
    courseApi.getAll
  );

  const createMutation = useMutation(scheduleApi.create, {
    onSuccess: () => {
      showNotification('Schedule created successfully', 'success');
      queryClient.invalidateQueries('schedules');
      handleCloseForm();
    },
  });

  const updateMutation = useMutation(
    (data) => scheduleApi.update(selectedSchedule._id, data),
    {
      onSuccess: () => {
        showNotification('Schedule updated successfully', 'success');
        queryClient.invalidateQueries('schedules');
        handleCloseForm();
      },
    }
  );

  const deleteMutation = useMutation(
    () => scheduleApi.delete(selectedSchedule._id),
    {
      onSuccess: () => {
        showNotification('Schedule deleted successfully', 'success');
        queryClient.invalidateQueries('schedules');
        setIsDeleteDialogOpen(false);
      },
    }
  );

  const toggleCancelMutation = useMutation(
    (schedule) => 
      schedule.isCanceled 
        ? scheduleApi.restore(schedule._id)
        : scheduleApi.cancel(schedule._id),
    {
      onSuccess: (_, schedule) => {
        showNotification(
          `Class ${schedule.isCanceled ? 'restored' : 'cancelled'} successfully`,
          'success'
        );
        queryClient.invalidateQueries('schedules');
      },
    }
  );

  const handleOpenForm = (schedule = null) => {
    setSelectedSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedSchedule(null);
    setIsFormOpen(false);
  };

  const handleOpenDeleteDialog = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (values) => {
    if (selectedSchedule) {
      await updateMutation.mutate(values);
    } else {
      await createMutation.mutate(values);
    }
  };

  if (isLoadingSchedules || isLoadingCourses) return <LoadingOverlay />;

  const events = schedules?.map(schedule => ({
    id: schedule._id,
    title: schedule.title,
    start: new Date(schedule.startTime),
    end: new Date(schedule.endTime),
    isCanceled: schedule.isCanceled,
    backgroundColor: schedule.isCanceled ? '#ccc' : undefined,
    textColor: schedule.isCanceled ? '#666' : undefined,
    schedule,
  })) || [];

  return (
    <>
      <SEO title="Manage Schedule" />
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">Manage Schedule</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Class
          </Button>
        </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Calendar
            events={events}
            onEventClick={(event) => handleOpenForm(event.schedule)}
          />
        </Paper>

        {!schedules?.length ? (
          <NoData message="No classes scheduled" />
        ) : (
          <Grid container spacing={3}>
            {schedules.map((schedule) => (
              <Grid item xs={12} sm={6} md={4} key={schedule._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <EventIcon color="primary" />
                      <Box>
                        <Typography variant="h6">{schedule.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(schedule.startTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {`${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={schedule.isCanceled ? 'Cancelled' : 'Active'}
                        color={schedule.isCanceled ? 'error' : 'success'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {schedule.location}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenForm(schedule)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(schedule)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color={schedule.isCanceled ? 'success' : 'warning'}
                      onClick={() => toggleCancelMutation.mutate(schedule)}
                    >
                      {schedule.isCanceled ? <RestoreIcon /> : <CancelIcon />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <FormDialog
          open={isFormOpen}
          onClose={handleCloseForm}
          title={selectedSchedule ? 'Edit Class' : 'Add Class'}
          maxWidth="md"
        >
          <ScheduleForm
            initialValues={selectedSchedule}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isLoading || updateMutation.isLoading}
            courses={courses}
          />
        </FormDialog>

        <ConfirmDialog
          open={isDeleteDialogOpen}
          title="Delete Class"
          message={`Are you sure you want to delete "${selectedSchedule?.title}"? This action cannot be undone.`}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setIsDeleteDialogOpen(false)}
          isLoading={deleteMutation.isLoading}
          severity="error"
        />

        <NotificationComponent />
      </Box>
    </>
  );
}

// Use AdminLayout for this page
AdminSchedule.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

// Export with admin authentication protection
export default withAuth(AdminSchedule, { requireAdmin: true });
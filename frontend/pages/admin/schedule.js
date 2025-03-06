import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import useNotification from '../../hooks/useNotification';
import FormDialog from '../../components/FormDialog';
import ScheduleForm from '../../components/ScheduleForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import Calendar from '../../components/Calendar';
import useMutation from '../../hooks/useMutation';
import { scheduleApi, courseApi } from '../../utils/api';

export default function ScheduleAdminPage() {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();

  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery(
    ['schedules'],
    scheduleApi.getAll
  );

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery(
    ['courses'],
    courseApi.getAll
  );

  const createMutation = useMutation(scheduleApi.create, {
    onSuccess: () => {
      showNotification('Schedule created successfully', 'success');
      queryClient.invalidateQueries(['schedules']);
      handleCloseForm();
    },
    onError: (error) => {
      showNotification(error.message, 'error');
    },
  });

  const updateMutation = useMutation(
    (data) => scheduleApi.update(selectedSchedule._id, data),
    {
      onSuccess: () => {
        showNotification('Schedule updated successfully', 'success');
        queryClient.invalidateQueries(['schedules']);
        handleCloseForm();
      },
      onError: (error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const deleteMutation = useMutation(
    () => scheduleApi.delete(selectedSchedule._id),
    {
      onSuccess: () => {
        showNotification('Schedule deleted successfully', 'success');
        queryClient.invalidateQueries(['schedules']);
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const toggleCancelMutation = useMutation(
    (schedule) =>
      scheduleApi.update(schedule._id, {
        isCanceled: !schedule.isCanceled,
      }),
    {
      onSuccess: (_, schedule) => {
        showNotification(
          `Class ${schedule.isCanceled ? 'restored' : 'canceled'} successfully`,
          'success'
        );
        queryClient.invalidateQueries(['schedules']);
      },
      onError: (error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const handleAddNew = () => {
    setSelectedSchedule(null);
    setIsFormOpen(true);
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDelete = (schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleCancel = (schedule) => {
    toggleCancelMutation.mutate(schedule);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSchedule(null);
  };

  return (
    <AdminLayout>
      <Calendar
        schedules={schedules}
        courses={courses}
        isLoading={isLoadingSchedules || isLoadingCourses}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleCancel={handleToggleCancel}
      />

      <FormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        title={selectedSchedule ? 'Edit Schedule' : 'Add New Schedule'}
      >
        <ScheduleForm
          courses={courses}
          initialValues={selectedSchedule}
          onSubmit={(values) => {
            if (selectedSchedule) {
              updateMutation.mutate(values);
            } else {
              createMutation.mutate(values);
            }
          }}
          isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        />
      </FormDialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
        isLoading={deleteMutation.isLoading}
      />

      <NotificationComponent />
    </AdminLayout>
  );
}
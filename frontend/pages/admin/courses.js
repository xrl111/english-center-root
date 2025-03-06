import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/AdminLayout';
import useNotification from '../../hooks/useNotification';
import FormDialog from '../../components/FormDialog';
import CourseForm from '../../components/CourseForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import DataTable from '../../components/DataTable';
import useMutation from '../../hooks/useMutation';
import { courseApi } from '../../utils/api';

export default function CoursesAdminPage() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();

  const { data: courses = [], isLoading } = useQuery(['courses'], courseApi.getAll);

  const createMutation = useMutation(courseApi.create, {
    onSuccess: () => {
      showNotification('Course created successfully', 'success');
      queryClient.invalidateQueries(['courses']);
      handleCloseForm();
    },
    onError: (error) => {
      showNotification(error.message, 'error');
    },
  });

  const updateMutation = useMutation(
    (data) => courseApi.update(selectedCourse._id, data),
    {
      onSuccess: () => {
        showNotification('Course updated successfully', 'success');
        queryClient.invalidateQueries(['courses']);
        handleCloseForm();
      },
      onError: (error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const deleteMutation = useMutation(
    () => courseApi.delete(selectedCourse._id),
    {
      onSuccess: () => {
        showNotification('Course deleted successfully', 'success');
        queryClient.invalidateQueries(['courses']);
        setIsDeleteDialogOpen(false);
      },
      onError: (error) => {
        showNotification(error.message, 'error');
      },
    }
  );

  const handleAddNew = () => {
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCourse(null);
  };

  return (
    <AdminLayout>
      <DataTable
        title="Courses"
        data={courses}
        isLoading={isLoading}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        title={selectedCourse ? 'Edit Course' : 'Add New Course'}
      >
        <CourseForm
          initialValues={selectedCourse}
          onSubmit={(values) => {
            if (selectedCourse) {
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
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        isLoading={deleteMutation.isLoading}
      />

      <NotificationComponent />
    </AdminLayout>
  );
}
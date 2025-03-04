import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
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
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import AdminLayout from '../../components/AdminLayout';
import { withAuth } from '../../components/withAuth';
import CourseForm from '../../components/CourseForm';
import FormDialog from '../../components/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingOverlay from '../../components/LoadingOverlay';
import NoData from '../../components/NoData';
import SEO from '../../components/SEO';
import useNotification from '../../hooks/useNotification';
import useMutation from '../../hooks/useMutation';
import { courseApi } from '../../utils/api';
import { formatDateRange } from '../../utils/dateUtils';

function AdminCourses() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();

  const { data: courses, isLoading } = useQuery('courses', courseApi.getAll);

  const createMutation = useMutation(courseApi.create, {
    onSuccess: () => {
      showNotification('Course created successfully', 'success');
      queryClient.invalidateQueries('courses');
      handleCloseForm();
    },
  });

  const updateMutation = useMutation(
    (data) => courseApi.update(selectedCourse._id, data),
    {
      onSuccess: () => {
        showNotification('Course updated successfully', 'success');
        queryClient.invalidateQueries('courses');
        handleCloseForm();
      },
    }
  );

  const deleteMutation = useMutation(
    () => courseApi.delete(selectedCourse._id),
    {
      onSuccess: () => {
        showNotification('Course deleted successfully', 'success');
        queryClient.invalidateQueries('courses');
        setIsDeleteDialogOpen(false);
      },
    }
  );

  const handleOpenForm = (course = null) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedCourse(null);
    setIsFormOpen(false);
  };

  const handleOpenDeleteDialog = (course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (values) => {
    if (selectedCourse) {
      await updateMutation.mutate(values);
    } else {
      await createMutation.mutate(values);
    }
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SEO title="Manage Courses" />
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">Manage Courses</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Course
          </Button>
        </Box>

        {!courses?.length ? (
          <NoData message="No courses found" />
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card>
                  {course.image && (
                    <Box
                      component="img"
                      src={course.image}
                      alt={course.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {course.title}
                    </Typography>
                    <Chip
                      label={course.level}
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                      }}
                    >
                      {course.description}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {formatDateRange(course.startDate, course.endDate)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenForm(course)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(course)}
                    >
                      <DeleteIcon />
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
          title={selectedCourse ? 'Edit Course' : 'Add Course'}
          maxWidth="md"
        >
          <CourseForm
            initialValues={selectedCourse}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isLoading || updateMutation.isLoading}
          />
        </FormDialog>

        <ConfirmDialog
          open={isDeleteDialogOpen}
          title="Delete Course"
          message={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone.`}
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
AdminCourses.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

// Export with admin authentication protection
export default withAuth(AdminCourses, { requireAdmin: true });
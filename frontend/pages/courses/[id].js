import { useState } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useQueryClient } from 'react-query';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Today as TodayIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { courseApi } from '../../utils/api';
import SEO from '../../components/SEO';
import LoadingOverlay from '../../components/LoadingOverlay';
import FormDialog from '../../components/FormDialog';
import CourseForm from '../../components/CourseForm';
import ConfirmDialog from '../../components/ConfirmDialog';
import useNotification, { showSuccess, showError } from '../../hooks/useNotification';
import useMutation from '../../hooks/useMutation';
import { formatDate, formatDateRange } from '../../utils/dateUtils';

export default function CourseDetails() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: course, isLoading } = useQuery(
    ['course', id],
    () => courseApi.getById(id),
    {
      enabled: !!id,
    }
  );

  const updateCourseMutation = useMutation(
    (data) => courseApi.update(id, data),
    {
      onSuccess: () => {
        showSuccess(showNotification, 'Course updated successfully');
        setIsEditDialogOpen(false);
        queryClient.invalidateQueries(['course', id]);
      },
      onError: (error) => {
        showError(showNotification, error.message);
      },
    }
  );

  const deleteCourseMutation = useMutation(() => courseApi.delete(id), {
    onSuccess: () => {
      showSuccess(showNotification, 'Course deleted successfully');
      router.push('/courses');
    },
    onError: (error) => {
      showError(showNotification, error.message);
    },
  });

  if (isLoading) return <LoadingOverlay />;
  if (!course) return null;

  return (
    <>
      <SEO
        title={course.title}
        description={course.description}
        keywords={[course.level, 'course', 'education']}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {course.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                icon={<SchoolIcon />}
                label={course.level}
                color="primary"
              />
              <Chip
                icon={<TimeIcon />}
                label={course.duration}
                variant="outlined"
              />
            </Box>
          </Box>
          <Box>
            <IconButton
              onClick={() => setIsEditDialogOpen(true)}
              color="primary"
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => setIsDeleteDialogOpen(true)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {course.image && (
              <Box
                component="img"
                src={course.image}
                alt={course.title}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 4,
                }}
              />
            )}

            <Typography variant="h5" gutterBottom>
              Course Description
            </Typography>
            <Typography paragraph>{course.description}</Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" gutterBottom>
              Schedule
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography>
                    {formatDateRange(course.startDate, course.endDate)}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  component="a"
                  href="/schedule"
                  sx={{ mt: 1 }}
                >
                  View Full Schedule
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Details
                </Typography>
                <Box sx={{ '& > *': { mb: 2 } }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Start Date
                    </Typography>
                    <Typography>{formatDate(course.startDate)}</Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      End Date
                    </Typography>
                    <Typography>{formatDate(course.endDate)}</Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Duration
                    </Typography>
                    <Typography>{course.duration}</Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Level
                    </Typography>
                    <Typography>{course.level}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Course Dialog */}
      <FormDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Course"
        maxWidth="md"
      >
        <CourseForm
          initialValues={{
            ...course,
            startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
            endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : ''
          }}
          onSubmit={(values) => {
            const formattedData = {
              ...values,
              startDate: new Date(values.startDate).toISOString(),
              endDate: new Date(values.endDate).toISOString()
            };
            updateCourseMutation.mutate(formattedData);
          }}
          isSubmitting={updateCourseMutation.isLoading}
        />
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => deleteCourseMutation.mutate()}
        onCancel={() => setIsDeleteDialogOpen(false)}
        isLoading={deleteCourseMutation.isLoading}
        severity="error"
      />

      <NotificationComponent />
    </>
  );
}
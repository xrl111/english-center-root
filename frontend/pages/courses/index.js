import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Box,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { courseApi } from '../../utils/api';
import SEO from '../../components/SEO';
import ContentCard from '../../components/ContentCard';
import NoData from '../../components/NoData';
import LoadingOverlay from '../../components/LoadingOverlay';
import FormDialog from '../../components/FormDialog';
import CourseForm from '../../components/CourseForm';
import useNotification, { showSuccess, showError } from '../../hooks/useNotification';
import useMutation from '../../hooks/useMutation';

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function Courses() {
  const [filters, setFilters] = useState({
    search: '',
    level: 'All Levels',
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { showNotification, NotificationComponent } = useNotification();

  // Fetch courses
  const {
    data: courses,
    isLoading,
    error,
    refetch,
  } = useQuery(['courses', filters], () =>
    courseApi.getAll({
      search: filters.search,
      level: filters.level === 'All Levels' ? undefined : filters.level,
    })
  );

  // Create course mutation
  const createCourseMutation = useMutation(courseApi.create, {
    onSuccess: () => {
      showSuccess(showNotification, 'Course created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      showError(showNotification, error.message);
    },
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCourse = async (values) => {
    await createCourseMutation.mutate(values);
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SEO
        title="Courses"
        description="Browse our comprehensive selection of courses"
        keywords={['courses', 'education', 'learning']}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h3" component="h1">
            Courses
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Add Course
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              name="search"
              label="Search Courses"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                name="level"
                value={filters.level}
                onChange={handleFilterChange}
                label="Level"
              >
                {levels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Course List */}
        {error ? (
          <NoData
            title="Error Loading Courses"
            message="There was an error loading the courses. Please try again later."
          />
        ) : courses?.length > 0 ? (
          <Grid container spacing={4}>
            {courses.map((course) => (
              <Grid item key={course._id} xs={12} sm={6} md={4}>
                <ContentCard
                  title={course.title}
                  description={course.description}
                  image={course.image}
                  category={course.level}
                  chips={[course.duration]}
                  link={`/courses/${course._id}`}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoData
            title="No Courses Found"
            message="No courses match your search criteria."
          />
        )}
      </Container>

      {/* Create Course Dialog */}
      <FormDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create New Course"
        maxWidth="md"
      >
        <CourseForm
          onSubmit={handleCreateCourse}
          isSubmitting={createCourseMutation.isLoading}
        />
      </FormDialog>

      <NotificationComponent />
    </>
  );
}
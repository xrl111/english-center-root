import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import MainLayout from '../components/Layout/MainLayout';
import Calendar from '../components/Calendar';
import LoadingOverlay from '../components/LoadingOverlay';
import { courseApi, scheduleApi } from '../utils/api';

export default function SchedulePage() {
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Fetch courses for filter
  const { data: courses = [] } = useQuery(['courses'], () => courseApi.getAll());

  // Fetch schedules
  const { data: schedules = [], isLoading } = useQuery(
    ['schedules', selectedCourse],
    () => 
      selectedCourse === 'all'
        ? scheduleApi.getAll()
        : scheduleApi.getByCourse(selectedCourse)
  );

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Class Schedule
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Course</InputLabel>
            <Select
              value={selectedCourse}
              label="Filter by Course"
              onChange={handleCourseChange}
            >
              <MenuItem value="all">All Courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {isLoading ? (
          <LoadingOverlay />
        ) : (
          <Calendar
            schedules={schedules}
            courses={courses}
            isReadOnly
            showFilters={false}
          />
        )}
      </Container>
    </MainLayout>
  );
}
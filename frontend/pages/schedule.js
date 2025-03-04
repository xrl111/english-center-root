import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
} from '@mui/material';
import { scheduleApi, courseApi } from '../utils/api';
import SEO from '../components/SEO';
import SimpleCalendar from '../components/SimpleCalendar';
import LoadingOverlay from '../components/LoadingOverlay';
import NoData from '../components/NoData';
import useNotification from '../hooks/useNotification';
import { formatScheduleDateRange } from '../utils/dateUtils';

export default function Schedule() {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { NotificationComponent } = useNotification();

  // Fetch courses for filter
  const { data: courses } = useQuery('courses', () => courseApi.getAll());

  // Fetch schedules
  const { data: schedules, isLoading } = useQuery(
    ['schedules', selectedCourse],
    () => scheduleApi.getAll({
      courseId: selectedCourse === 'all' ? undefined : selectedCourse,
    })
  );

  // Transform schedules for Calendar
  const events = schedules?.map((schedule) => ({
    id: schedule._id,
    title: schedule.title,
    start: schedule.startTime,
    end: schedule.endTime,
    backgroundColor: schedule.isCanceled ? '#dc3545' : undefined,
    extendedProps: {
      course: schedule.course,
      instructor: schedule.instructor,
      location: schedule.location,
      isCanceled: schedule.isCanceled,
    },
  })) || [];

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseEventDialog = () => {
    setSelectedEvent(null);
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SEO
        title="Class Schedule"
        description="View the complete schedule of all classes and courses"
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Class Schedule
        </Typography>

        {/* Course Filter */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Course</InputLabel>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  label="Filter by Course"
                >
                  <MenuItem value="all">All Courses</MenuItem>
                  {courses?.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Calendar */}
        <Card>
          <CardContent>
            {events.length > 0 ? (
              <SimpleCalendar
                events={events}
                onEventClick={handleEventClick}
              />
            ) : (
              <NoData
                title="No Classes Scheduled"
                message="There are no classes scheduled for the selected course."
              />
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Event Details Dialog */}
      <Dialog
        open={Boolean(selectedEvent)}
        onClose={handleCloseEventDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              {selectedEvent.title}
              {selectedEvent.extendedProps.isCanceled && (
                <Typography color="error" variant="subtitle2">
                  This class has been canceled
                </Typography>
              )}
            </DialogTitle>
            <DialogContent>
              <DialogContentText component="div">
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Course
                  </Typography>
                  <Typography>{selectedEvent.extendedProps.course.title}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Time
                  </Typography>
                  <Typography>
                    {formatScheduleDateRange(
                      selectedEvent.start,
                      selectedEvent.end
                    )}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Instructor
                  </Typography>
                  <Typography>{selectedEvent.extendedProps.instructor}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Location
                  </Typography>
                  <Typography>{selectedEvent.extendedProps.location}</Typography>
                </Box>
              </DialogContentText>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleCloseEventDialog}>Close</Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      <NotificationComponent />
    </>
  );
}
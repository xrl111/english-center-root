import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  TextField,
  Grid,
  MenuItem,
  Box,
  Button,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { addHours } from 'date-fns';

const validationSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  courseId: yup
    .string()
    .required('Course is required'),
  instructor: yup
    .string()
    .required('Instructor is required'),
  location: yup
    .string()
    .required('Location is required'),
  startTime: yup
    .date()
    .required('Start time is required'),
  endTime: yup
    .date()
    .required('End time is required')
    .min(
      yup.ref('startTime'),
      'End time must be after start time'
    ),
  maxAttendees: yup
    .number()
    .positive('Must be a positive number')
    .integer('Must be a whole number')
    .required('Maximum attendees is required'),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters'),
});

const ScheduleForm = ({ initialValues, onSubmit, isSubmitting, courses = [] }) => {
  const formik = useFormik({
    initialValues: {
      title: '',
      courseId: '',
      instructor: '',
      location: '',
      startTime: new Date(),
      endTime: addHours(new Date(), 2),
      maxAttendees: 20,
      description: '',
      isCanceled: false,
      ...initialValues,
    },
    validationSchema,
    onSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="title"
            label="Class Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            name="courseId"
            label="Course"
            value={formik.values.courseId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.courseId && Boolean(formik.errors.courseId)}
            helperText={formik.touched.courseId && formik.errors.courseId}
          >
            {courses.map((course) => (
              <MenuItem key={course._id} value={course._id}>
                {course.title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="instructor"
            label="Instructor"
            value={formik.values.instructor}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.instructor && Boolean(formik.errors.instructor)}
            helperText={formik.touched.instructor && formik.errors.instructor}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="location"
            label="Location"
            value={formik.values.location}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="Start Time"
            value={formik.values.startTime}
            onChange={(value) => formik.setFieldValue('startTime', value)}
            onBlur={() => formik.setFieldTouched('startTime')}
            slotProps={{
              textField: {
                fullWidth: true,
                error: formik.touched.startTime && Boolean(formik.errors.startTime),
                helperText: formik.touched.startTime && formik.errors.startTime,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="End Time"
            value={formik.values.endTime}
            onChange={(value) => formik.setFieldValue('endTime', value)}
            onBlur={() => formik.setFieldTouched('endTime')}
            slotProps={{
              textField: {
                fullWidth: true,
                error: formik.touched.endTime && Boolean(formik.errors.endTime),
                helperText: formik.touched.endTime && formik.errors.endTime,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="maxAttendees"
            label="Maximum Attendees"
            type="number"
            InputProps={{
              inputProps: { min: 1 },
              endAdornment: <InputAdornment position="end">students</InputAdornment>,
            }}
            value={formik.values.maxAttendees}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxAttendees && Boolean(formik.errors.maxAttendees)}
            helperText={formik.touched.maxAttendees && formik.errors.maxAttendees}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="description"
            label="Description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="isCanceled"
                checked={formik.values.isCanceled}
                onChange={formik.handleChange}
              />
            }
            label="Class is canceled"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !formik.isValid}
            >
              {isSubmitting ? 'Saving...' : 'Save Class'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ScheduleForm;
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  TextField,
  Grid,
  Box,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { addMonths } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const validationSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  level: yup.string().required('Level is required'),
  duration: yup.string().required('Duration is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  maxStudents: yup
    .number()
    .required('Maximum students is required')
    .min(1, 'Must allow at least 1 student')
    .integer('Must be a whole number'),
  instructor: yup.string().required('Instructor is required'),
  prerequisites: yup.array().of(yup.string()),
  syllabus: yup.string(),
  isActive: yup.boolean(),
});

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const CourseForm = ({ initialValues, onSubmit, isSubmitting }) => {
  const [selectedInstructor, setSelectedInstructor] = useState('');
  
  const { data: instructors = [] } = useQuery(['instructors'], () =>
    api.get('/api/users?role=instructor').then(res => res.data)
  );

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      level: '',
      duration: '',
      startDate: new Date(),
      endDate: addMonths(new Date(), 3),
      maxStudents: 20,
      instructor: '',
      prerequisites: [],
      syllabus: '',
      isActive: true,
      ...initialValues,
    },
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    if (initialValues?.instructor) {
      setSelectedInstructor(initialValues.instructor);
    }
  }, [initialValues]);

  const handlePrerequisitesChange = (event) => {
    const prerequisites = event.target.value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    formik.setFieldValue('prerequisites', prerequisites);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="title"
            label="Course Title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
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

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            name="level"
            label="Level"
            value={formik.values.level}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.level && Boolean(formik.errors.level)}
            helperText={formik.touched.level && formik.errors.level}
          >
            {levels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="duration"
            label="Duration"
            placeholder="e.g., 3 months"
            value={formik.values.duration}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.duration && Boolean(formik.errors.duration)}
            helperText={formik.touched.duration && formik.errors.duration}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="Start Date"
            value={formik.values.startDate}
            onChange={(value) => formik.setFieldValue('startDate', value)}
            onBlur={() => formik.setFieldTouched('startDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                error: formik.touched.startDate && Boolean(formik.errors.startDate),
                helperText: formik.touched.startDate && formik.errors.startDate,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="End Date"
            value={formik.values.endDate}
            onChange={(value) => formik.setFieldValue('endDate', value)}
            onBlur={() => formik.setFieldTouched('endDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                error: formik.touched.endDate && Boolean(formik.errors.endDate),
                helperText: formik.touched.endDate && formik.errors.endDate,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            name="instructor"
            label="Instructor"
            value={selectedInstructor}
            onChange={(e) => {
              setSelectedInstructor(e.target.value);
              formik.setFieldValue('instructor', e.target.value);
            }}
            error={formik.touched.instructor && Boolean(formik.errors.instructor)}
            helperText={formik.touched.instructor && formik.errors.instructor}
          >
            {instructors.map((instructor) => (
              <MenuItem key={instructor._id} value={instructor._id}>
                {instructor.username}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="maxStudents"
            label="Maximum Students"
            type="number"
            InputProps={{
              inputProps: { min: 1 },
              endAdornment: <InputAdornment position="end">students</InputAdornment>,
            }}
            value={formik.values.maxStudents}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.maxStudents && Boolean(formik.errors.maxStudents)}
            helperText={formik.touched.maxStudents && formik.errors.maxStudents}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="prerequisites"
            label="Prerequisites (comma-separated)"
            value={formik.values.prerequisites.join(', ')}
            onChange={handlePrerequisitesChange}
            onBlur={formik.handleBlur}
            error={formik.touched.prerequisites && Boolean(formik.errors.prerequisites)}
            helperText={
              (formik.touched.prerequisites && formik.errors.prerequisites) ||
              'Enter prerequisites separated by commas'
            }
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            name="syllabus"
            label="Syllabus"
            value={formik.values.syllabus}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.syllabus && Boolean(formik.errors.syllabus)}
            helperText={formik.touched.syllabus && formik.errors.syllabus}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={formik.values.isActive}
                onChange={formik.handleChange}
              />
            }
            label="Course is active"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !formik.isValid}
            >
              {isSubmitting ? 'Saving...' : initialValues ? 'Update Course' : 'Create Course'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default CourseForm;
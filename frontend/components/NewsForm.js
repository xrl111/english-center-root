import { useFormik } from 'formik';
import {
  TextField,
  Grid,
  Box,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { newsSchema } from '../utils/validationSchemas';
import FileUploader from './FileUploader';

const categories = [
  'Announcement',
  'Event',
  'Course Update',
  'Blog',
  'Press Release',
];

const NewsForm = ({ initialValues, onSubmit, isSubmitting }) => {
  const formik = useFormik({
    initialValues: {
      title: '',
      content: '',
      category: '',
      tags: [],
      imageUrl: '',
      publishDate: new Date(),
      isPublished: false,
      ...initialValues,
      tags: initialValues?.tags?.join(', ') || '',
    },
    validationSchema: newsSchema,
    onSubmit,
  });

  const handleImageChange = (imageUrl, error) => {
    formik.setFieldValue('imageUrl', imageUrl);
    if (error) {
      formik.setFieldError('imageUrl', error);
    }
  };

  const handleTagsChange = (event) => {
    const tags = event.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    formik.setFieldValue('tags', tags);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="title"
            label="Title"
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
            rows={6}
            name="content"
            label="Content"
            value={formik.values.content}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.content && Boolean(formik.errors.content)}
            helperText={formik.touched.content && formik.errors.content}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            name="category"
            label="Category"
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.category && Boolean(formik.errors.category)}
            helperText={formik.touched.category && formik.errors.category}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="Publish Date"
            value={formik.values.publishDate}
            onChange={(value) => formik.setFieldValue('publishDate', value)}
            onBlur={() => formik.setFieldTouched('publishDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                error: formik.touched.publishDate && Boolean(formik.errors.publishDate),
                helperText: formik.touched.publishDate && formik.errors.publishDate,
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            name="tags"
            label="Tags (comma-separated)"
            value={formik.values.tags}
            onChange={handleTagsChange}
            onBlur={formik.handleBlur}
            error={formik.touched.tags && Boolean(formik.errors.tags)}
            helperText={
              (formik.touched.tags && formik.errors.tags) ||
              'Enter tags separated by commas'
            }
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Featured Image
          </Typography>
          <FileUploader
            value={formik.values.imageUrl}
            onChange={handleImageChange}
            error={formik.touched.imageUrl && formik.errors.imageUrl}
            imageOptions={{
              maxWidth: 1200,
              maxHeight: 800,
              quality: 0.8,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                name="isPublished"
                checked={formik.values.isPublished}
                onChange={formik.handleChange}
              />
            }
            label="Publish immediately"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !formik.isValid}
            >
              {isSubmitting
                ? 'Saving...'
                : initialValues
                ? 'Update News'
                : 'Create News'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default NewsForm;
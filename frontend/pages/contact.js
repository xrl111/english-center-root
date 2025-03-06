import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Divider,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { contactApi } from '../utils/api';
import SEO from '../components/SEO';
import config from '../config';
import useNotification, { showSuccess, showError } from '../hooks/useNotification';
import useMutation from '../hooks/useMutation';
import MainLayout from '../components/Layout/MainLayout';

const validationSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  subject: yup.string().required('Subject is required'),
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Message should be at least 10 characters'),
});

export default function Contact() {
  const { showNotification, NotificationComponent } = useNotification();

  const contactMutation = useMutation(contactApi.send, {
    onSuccess: () => {
      showSuccess(showNotification, 'Thank you for your message. We will get back to you soon!');
      formik.resetForm();
    },
    onError: error => {
      showError(showNotification, error.message);
    },
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
    validationSchema,
    onSubmit: async values => {
      await contactMutation.mutate(values);
    },
  });

  return (
    <>
      <MainLayout>
        <SEO title="Contact Us" description="Get in touch with us for any inquiries or support" />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Contact Us
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon
            as possible.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Send us a Message
                  </Typography>
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="name"
                          label="Your Name"
                          value={formik.values.name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.name && Boolean(formik.errors.name)}
                          helperText={formik.touched.name && formik.errors.name}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="email"
                          label="Your Email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && formik.errors.email}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="subject"
                          label="Subject"
                          value={formik.values.subject}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.subject && Boolean(formik.errors.subject)}
                          helperText={formik.touched.subject && formik.errors.subject}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={6}
                          name="message"
                          label="Message"
                          value={formik.values.message}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.message && Boolean(formik.errors.message)}
                          helperText={formik.touched.message && formik.errors.message}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={contactMutation.isLoading}
                        >
                          {contactMutation.isLoading ? 'Sending...' : 'Send Message'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Contact Information
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1">Email</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {config.contact.email}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1">Phone</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {config.contact.phone}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1">Address</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {config.contact.address}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>

        <NotificationComponent />
      </MainLayout>
    </>
  );
}

import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Divider,
} from '@mui/material';
import SEO from '../components/SEO';
import MainLayout from '../components/Layout/MainLayout';

const teamMembers = [
  {
    id: 1,
    name: 'John Doe',
    role: 'Principal',
    image: '/images/team/john-doe.jpg',
    bio: 'Expert in educational management with 15 years of experience.',
  },
  {
    id: 2,
    name: 'Jane Smith',
    role: 'Senior Instructor',
    image: '/images/team/jane-smith.jpg',
    bio: 'Specializes in advanced teaching methodologies and curriculum development.',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    role: 'Course Coordinator',
    image: '/images/team/mike-johnson.jpg',
    bio: 'Manages course scheduling and student progress tracking.',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    role: 'Student Support Specialist',
    image: '/images/team/sarah-wilson.jpg',
    bio: 'Provides academic guidance and support to students.',
  },
];

export default function About() {
  return (
    <>
      <MainLayout>
        <SEO
          title="About Us"
          description="Learn about our mission, vision, and the team behind our success"
        />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            About Us
          </Typography>

          {/* Mission & Vision */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Our Mission
                  </Typography>
                  <Typography variant="body1" paragraph>
                    To provide high-quality education and empower students with the knowledge and
                    skills needed for success in their chosen fields through innovative teaching
                    methods and comprehensive support.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Our Vision
                  </Typography>
                  <Typography variant="body1" paragraph>
                    To be a leading educational institution recognized for excellence in teaching,
                    innovation, and student achievement, fostering a community of lifelong learners.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Our Story */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Our Story
            </Typography>
            <Typography variant="body1" paragraph>
              Founded in 2020, our institution has grown from a small training center to a
              comprehensive educational institution. We have consistently evolved our curriculum and
              teaching methods to meet the changing needs of students and industry requirements.
            </Typography>
            <Typography variant="body1" paragraph>
              Today, we pride ourselves on our innovative approach to education, combining
              traditional teaching methods with modern technology to provide the best learning
              experience for our students. Our commitment to excellence and student success has made
              us a trusted name in education.
            </Typography>
          </Box>

          <Divider sx={{ mb: 6 }} />

          {/* Team Section */}
          <Typography variant="h4" component="h2" gutterBottom>
            Our Team
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Meet the dedicated professionals who make our institution a center of excellence in
            education.
          </Typography>

          <Grid container spacing={4}>
            {teamMembers.map(member => (
              <Grid item key={member.id} xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" component="h3" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Values */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              Our Values
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  title: 'Excellence',
                  description:
                    'We strive for excellence in everything we do, from teaching to student support.',
                },
                {
                  title: 'Innovation',
                  description:
                    'We embrace new technologies and teaching methods to enhance learning.',
                },
                {
                  title: 'Integrity',
                  description:
                    'We maintain high ethical standards and transparency in all our operations.',
                },
                {
                  title: 'Student Success',
                  description:
                    'We are committed to helping every student achieve their educational goals.',
                },
              ].map((value, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {value.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </MainLayout>
    </>
  );
}

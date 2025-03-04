import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Paper,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useQuery } from 'react-query';
import MainLayout from '../components/Layout/MainLayout';
import SEO from '../components/SEO';
import LoadingOverlay from '../components/LoadingOverlay';
import { courseApi, newsApi } from '../utils/api';
import { formatDate } from '../utils/dateUtils';

export default function HomePage() {
  const { data: featuredCourses, isLoading: isLoadingCourses } = useQuery(
    'featured-courses',
    () => courseApi.getAll({ featured: true, limit: 3 })
  );

  const { data: latestNews, isLoading: isLoadingNews } = useQuery(
    'latest-news',
    () => newsApi.getAll({ limit: 4, isPublished: true })
  );

  const stats = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} color="primary" />,
      value: '20+',
      label: 'Active Courses',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} color="primary" />,
      value: '500+',
      label: 'Students',
    },
    {
      icon: <EventIcon sx={{ fontSize: 40 }} color="primary" />,
      value: '100+',
      label: 'Weekly Classes',
    },
  ];

  return (
    <>
      <SEO title="Home" />

      {/* Hero Section */}
      <Box
        sx={{
          background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                }}
              >
                Master English with Expert Guidance
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Join our comprehensive English learning programs designed to help you
                achieve fluency and confidence.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  href="/courses"
                >
                  Explore Courses
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  component={Link}
                  href="/about"
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Add hero image or illustration here */}
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                {stat.icon}
                <Typography variant="h3" sx={{ my: 2, fontWeight: 700 }}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Courses Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Featured Courses</Typography>
          <Button
            component={Link}
            href="/courses"
            endIcon={<ArrowForwardIcon />}
          >
            View All Courses
          </Button>
        </Box>
        {isLoadingCourses ? (
          <LoadingOverlay />
        ) : (
          <Grid container spacing={3}>
            {featuredCourses?.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {course.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={course.image}
                      alt={course.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {course.title}
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {course.description}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip label={course.level} color="primary" size="small" />
                      <Chip label={course.duration} size="small" />
                    </Stack>
                    <Button
                      component={Link}
                      href={`/courses/${course._id}`}
                      variant="contained"
                      fullWidth
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Latest News Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">Latest News</Typography>
            <Button
              component={Link}
              href="/news"
              endIcon={<ArrowForwardIcon />}
            >
              View All News
            </Button>
          </Box>
          {isLoadingNews ? (
            <LoadingOverlay />
          ) : (
            <Grid container spacing={3}>
              {latestNews?.map((article) => (
                <Grid item xs={12} sm={6} md={3} key={article._id}>
                  <Card>
                    {article.imageUrl && (
                      <CardMedia
                        component="img"
                        height="160"
                        image={article.imageUrl}
                        alt={article.title}
                      />
                    )}
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h3"
                        className="line-clamp-2"
                      >
                        {article.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        className="line-clamp-3"
                      >
                        {article.content}
                      </Typography>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(article.publishDate)}
                        </Typography>
                        <Button
                          component={Link}
                          href={`/news/${article._id}`}
                          size="small"
                        >
                          Read More
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </>
  );
}

// Use MainLayout for this page
HomePage.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  TextField,
  MenuItem,
} from '@mui/material';
import Link from 'next/link';
import MainLayout from '../../components/Layout/MainLayout';
import LoadingOverlay from '../../components/LoadingOverlay';
import { courseApi } from '../../utils/api';

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function CoursesPage() {
  const [filters, setFilters] = useState({
    level: 'All',
    search: '',
  });

  const {
    data: courses = [],
    isLoading,
    refetch,
  } = useQuery(['courses', filters], () =>
    courseApi.getAll({
      level: filters.level === 'All' ? undefined : filters.level,
      search: filters.search || undefined,
    })
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Our Courses
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                name="search"
                label="Search Courses"
                value={filters.search}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                name="level"
                label="Level"
                value={filters.level}
                onChange={handleFilterChange}
              >
                {levels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {isLoading ? (
          <LoadingOverlay />
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {course.description}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {course.level}
                      </Typography>
                      <Button
                        component={Link}
                        href={`/courses/${course._id}`}
                        variant="contained"
                        size="small"
                      >
                        Learn More
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MainLayout>
  );
}
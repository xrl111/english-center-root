import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Article as ArticleIcon,
  Event as EventIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Add as AddIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarMonthIcon,
  Newspaper as NewspaperIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import AdminLayout from '../../components/Layout/AdminLayout';

const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, mr: 2 }}>{icon}</Avatar>
        <Typography variant="h6" component="div" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          size="small"
          sx={{
            mr: 1,
            bgcolor: trend === 'up' ? 'success.light' : 'error.light',
            color: trend === 'up' ? 'success.main' : 'error.main',
            '&:hover': {
              bgcolor: trend === 'up' ? 'success.light' : 'error.light',
            },
          }}
        >
          {trend === 'up' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>
        <Typography variant="body2" color={trend === 'up' ? 'success.main' : 'error.main'}>
          {trendValue}% from last month
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const QuickAction = ({ icon, title, href, color }) => (
  <Button
    component={Link}
    href={href}
    variant="outlined"
    startIcon={icon}
    fullWidth
    sx={{
      py: 2,
      borderColor: `${color}.main`,
      color: `${color}.main`,
      '&:hover': {
        borderColor: `${color}.dark`,
        bgcolor: `${color}.light`,
      },
    }}
  >
    {title}
  </Button>
);

const RecentActivity = ({ avatar, primary, secondary, date }) => (
  <ListItem>
    <ListItemAvatar>
      <Avatar sx={{ bgcolor: 'primary.light' }}>{avatar}</Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={primary}
      secondary={
        <Typography variant="caption" color="text.secondary">
          {secondary} • {date}
        </Typography>
      }
    />
  </ListItem>
);

const AdminDashboard = () => {
  const { data: stats = {}, isLoading } = useQuery(['admin', 'stats'], async () => {
    // Replace with actual API call
    return {
      totalStudents: 1250,
      totalCourses: 48,
      totalNews: 156,
      totalSchedules: 92,
      studentsTrend: 'up',
      studentsTrendValue: 12.5,
      coursesTrend: 'up',
      coursesTrendValue: 8.2,
      newsTrend: 'down',
      newsTrendValue: 5.1,
      schedulesTrend: 'up',
      schedulesTrendValue: 15.3,
    };
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your platform today.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<PeopleIcon />}
            trend={stats.studentsTrend}
            trendValue={stats.studentsTrendValue}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Courses"
            value={stats.totalCourses}
            icon={<SchoolIcon />}
            trend={stats.coursesTrend}
            trendValue={stats.coursesTrendValue}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="News Articles"
            value={stats.totalNews}
            icon={<ArticleIcon />}
            trend={stats.newsTrend}
            trendValue={stats.newsTrendValue}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Class Schedules"
            value={stats.totalSchedules}
            icon={<EventIcon />}
            trend={stats.schedulesTrend}
            trendValue={stats.schedulesTrendValue}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                <RecentActivity
                  avatar={<PersonIcon />}
                  primary="New Student Registration"
                  secondary="John Doe registered for Basic English Course"
                  date="2 hours ago"
                />
                <Divider component="li" />
                <RecentActivity
                  avatar={<CalendarMonthIcon />}
                  primary="Schedule Updated"
                  secondary="IELTS Preparation class time changed"
                  date="4 hours ago"
                />
                <Divider component="li" />
                <RecentActivity
                  avatar={<NewspaperIcon />}
                  primary="News Published"
                  secondary="New article about summer programs published"
                  date="6 hours ago"
                />
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <QuickAction
                  icon={<PersonIcon />}
                  title="Add New Student"
                  href="/admin/users/create"
                  color="primary"
                />
                <QuickAction
                  icon={<SchoolIcon />}
                  title="Create Course"
                  href="/admin/courses/create"
                  color="success"
                />
                <QuickAction
                  icon={<ArticleIcon />}
                  title="Post News"
                  href="/admin/news/create"
                  color="warning"
                />
                <QuickAction
                  icon={<EventIcon />}
                  title="Schedule Class"
                  href="/admin/schedule/create"
                  color="info"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminDashboard;

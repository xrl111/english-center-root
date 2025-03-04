import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Button,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  Article as ArticleIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { withAuth } from '../../components/withAuth';
import LoadingOverlay from '../../components/LoadingOverlay';
import SEO from '../../components/SEO';
import { formatDate } from '../../utils/dateUtils';

function AdminDashboard() {
  const router = useRouter();

  const { data: stats, isLoading: isLoadingStats } = useQuery(
    'dashboard-stats',
    async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  );

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery(
    'recent-activity',
    async () => {
      const response = await fetch('/api/admin/activity');
      if (!response.ok) throw new Error('Failed to fetch activity');
      return response.json();
    }
  );

  const statsCards = [
    {
      title: 'Total Courses',
      value: stats?.courses || 0,
      icon: <SchoolIcon sx={{ fontSize: 40 }} color="primary" />,
      link: '/admin/courses',
    },
    {
      title: 'Upcoming Classes',
      value: stats?.upcomingClasses || 0,
      icon: <EventIcon sx={{ fontSize: 40 }} color="primary" />,
      link: '/admin/schedule',
    },
    {
      title: 'Active News',
      value: stats?.activeNews || 0,
      icon: <ArticleIcon sx={{ fontSize: 40 }} color="primary" />,
      link: '/admin/news',
    },
    {
      title: 'Total Users',
      value: stats?.users || 0,
      icon: <GroupIcon sx={{ fontSize: 40 }} color="primary" />,
      link: '/admin/users',
    },
  ];

  if (isLoadingStats || isLoadingActivity) return <LoadingOverlay />;

  return (
    <>
      <SEO title="Admin Dashboard" />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          {statsCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <Paper elevation={2}>
                <Card>
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{ fontWeight: 'bold' }}
                        >
                          {card.value}
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                          {card.title}
                        </Typography>
                      </Box>
                      {card.icon}
                    </Stack>
                    <Button
                      endIcon={<ArrowForwardIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => router.push(card.link)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Paper>
            </Grid>
          ))}

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity?.map((activity, index) => (
                  <Box key={activity.id}>
                    <ListItem
                      secondaryAction={
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(activity.timestamp)}
                        </Typography>
                      }
                    >
                      <ListItemText
                        primary={activity.description}
                        secondary={activity.user}
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Active Sessions"
                    secondary={stats?.activeSessions || 0}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="New Users (This Week)"
                    secondary={stats?.newUsers || 0}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Scheduled Classes (This Week)"
                    secondary={stats?.weeklyClasses || 0}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Published News (This Month)"
                    secondary={stats?.monthlyNews || 0}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

// Use AdminLayout for this page
AdminDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

// Export with admin authentication protection
export default withAuth(AdminDashboard, { requireAdmin: true });
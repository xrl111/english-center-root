import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/Layout/AdminLayout';
import LoadingOverlay from '../../components/LoadingOverlay';
import { formatDate } from '../../utils/dateUtils';
import api from '../../utils/api';

export default function AdminDashboard() {
  const { data: stats, isLoading: isLoadingStats } = useQuery(
    ['dashboard-stats'],
    () => api.get('/admin/stats').then((res) => res.data)
  );

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery(
    ['recent-activity'],
    () => api.get('/admin/activity').then((res) => res.data)
  );

  if (isLoadingStats || isLoadingActivity) return <LoadingOverlay />;

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <PersonIcon sx={{ fontSize: 40 }} color="primary" />,
    },
    {
      title: 'Active Courses',
      value: stats?.activeCourses || 0,
      icon: <SchoolIcon sx={{ fontSize: 40 }} color="primary" />,
    },
    {
      title: 'Upcoming Classes',
      value: stats?.upcomingClasses || 0,
      icon: <EventIcon sx={{ fontSize: 40 }} color="primary" />,
    },
    {
      title: 'Published News',
      value: stats?.publishedNews || 0,
      icon: <ArticleIcon sx={{ fontSize: 40 }} color="primary" />,
    },
  ];

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {stat.icon}
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity?.map((activity) => (
                <ListItem key={activity._id} divider>
                  <ListItemIcon>
                    {activity.type === 'user' && <PersonIcon />}
                    {activity.type === 'course' && <SchoolIcon />}
                    {activity.type === 'schedule' && <EventIcon />}
                    {activity.type === 'news' && <ArticleIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={formatDate(activity.timestamp)}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    </AdminLayout>
  );
}
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { withAuth } from '../../../contexts/AuthContext';
import FormDialog from '../../../components/FormDialog';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingOverlay from '../../../components/LoadingOverlay';
import NoData from '../../../components/NoData';
import NewsForm from '../../../components/NewsForm';
import SEO from '../../../components/SEO';
import useNotification from '../../../hooks/useNotification';
import useMutation from '../../../hooks/useMutation';
import { newsApi } from '../../../utils/api';
import { formatDate } from '../../../utils/dateUtils';

function AdminNews() {
  const [selectedNews, setSelectedNews] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();

  const { data: news, isLoading } = useQuery(
    'news',
    newsApi.getAll
  );

  const createMutation = useMutation(newsApi.create, {
    onSuccess: () => {
      showNotification('News created successfully', 'success');
      queryClient.invalidateQueries('news');
      handleCloseForm();
    },
  });

  const updateMutation = useMutation(
    (data) => newsApi.update(selectedNews._id, data),
    {
      onSuccess: () => {
        showNotification('News updated successfully', 'success');
        queryClient.invalidateQueries('news');
        handleCloseForm();
      },
    }
  );

  const deleteMutation = useMutation(
    () => newsApi.delete(selectedNews._id),
    {
      onSuccess: () => {
        showNotification('News deleted successfully', 'success');
        queryClient.invalidateQueries('news');
        setIsDeleteDialogOpen(false);
      },
    }
  );

  const togglePublishMutation = useMutation(
    (news) => 
      news.isPublished 
        ? newsApi.unpublish(news._id)
        : newsApi.publish(news._id),
    {
      onSuccess: (_, news) => {
        showNotification(
          `News ${news.isPublished ? 'unpublished' : 'published'} successfully`,
          'success'
        );
        queryClient.invalidateQueries('news');
      },
    }
  );

  const handleOpenForm = (news = null) => {
    setSelectedNews(news);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedNews(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (values) => {
    if (selectedNews) {
      await updateMutation.mutate(values);
    } else {
      await createMutation.mutate(values);
    }
  };

  const handleOpenDeleteDialog = (news) => {
    setSelectedNews(news);
    setIsDeleteDialogOpen(true);
  };

  const handleTogglePublish = (news) => {
    togglePublishMutation.mutate(news);
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SEO title="Manage News" />
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">Manage News</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add News
          </Button>
        </Box>

        {!news?.length ? (
          <NoData message="No news articles found" />
        ) : (
          <Grid container spacing={3}>
            {news.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                      }}
                    >
                      {article.content}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        mb: 2,
                      }}
                    >
                      <Chip
                        size="small"
                        label={article.category}
                        color="primary"
                      />
                      <Chip
                        size="small"
                        label={article.isPublished ? 'Published' : 'Draft'}
                        color={article.isPublished ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {formatDate(article.updatedAt)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(article)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(article)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={article.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      <IconButton
                        size="small"
                        color={article.isPublished ? 'warning' : 'success'}
                        onClick={() => handleTogglePublish(article)}
                      >
                        {article.isPublished ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <FormDialog
          open={isFormOpen}
          onClose={handleCloseForm}
          title={selectedNews ? 'Edit News' : 'Add News'}
          maxWidth="md"
        >
          <NewsForm
            initialValues={selectedNews}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isLoading || updateMutation.isLoading}
          />
        </FormDialog>

        <ConfirmDialog
          open={isDeleteDialogOpen}
          title="Delete News"
          message={`Are you sure you want to delete "${selectedNews?.title}"? This action cannot be undone.`}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setIsDeleteDialogOpen(false)}
          isLoading={deleteMutation.isLoading}
          severity="error"
        />

        <NotificationComponent />
      </Box>
    </>
  );
}

// Use AdminLayout for this page
AdminNews.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

// Export with admin authentication protection
export default withAuth(AdminNews, { requireAdmin: true });
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from 'react-query';
import AdminLayout from '../../components/AdminLayout';
import { withAuth } from '../../components/withAuth';
import NewsForm from '../../components/NewsForm';
import FormDialog from '../../components/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingOverlay from '../../components/LoadingOverlay';
import NoData from '../../components/NoData';
import SEO from '../../components/SEO';
import useNotification from '../../hooks/useNotification';
import useMutation from '../../hooks/useMutation';
import { newsApi } from '../../utils/api';

function AdminNews() {
  const [selectedNews, setSelectedNews] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showNotification, NotificationComponent } = useNotification();

  const { data: newsArticles, isLoading } = useQuery('news', newsApi.getAll);

  const createMutation = useMutation(newsApi.create, {
    onSuccess: () => {
      showNotification('News article created successfully', 'success');
      queryClient.invalidateQueries('news');
      handleCloseForm();
    },
  });

  const updateMutation = useMutation(
    (data) => newsApi.update(selectedNews._id, data),
    {
      onSuccess: () => {
        showNotification('News article updated successfully', 'success');
        queryClient.invalidateQueries('news');
        handleCloseForm();
      },
    }
  );

  const deleteMutation = useMutation(
    () => newsApi.delete(selectedNews._id),
    {
      onSuccess: () => {
        showNotification('News article deleted successfully', 'success');
        queryClient.invalidateQueries('news');
        setIsDeleteDialogOpen(false);
      },
    }
  );

  const togglePublishMutation = useMutation(
    (article) => 
      article.isPublished 
        ? newsApi.unpublish(article._id)
        : newsApi.publish(article._id),
    {
      onSuccess: (_, article) => {
        showNotification(
          `Article ${article.isPublished ? 'unpublished' : 'published'} successfully`,
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

  const handleOpenDeleteDialog = (news) => {
    setSelectedNews(news);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (values) => {
    if (selectedNews) {
      await updateMutation.mutate(values);
    } else {
      await createMutation.mutate(values);
    }
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

        {!newsArticles?.length ? (
          <NoData message="No news articles found" />
        ) : (
          <Grid container spacing={3}>
            {newsArticles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article._id}>
                <Card>
                  {article.imageUrl && (
                    <Box
                      component="img"
                      src={article.imageUrl}
                      alt={article.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={article.category}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={article.isPublished ? 'Published' : 'Draft'}
                        color={article.isPublished ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {article.content}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenForm(article)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(article)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      color={article.isPublished ? 'warning' : 'success'}
                      onClick={() => togglePublishMutation.mutate(article)}
                    >
                      {article.isPublished ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <FormDialog
          open={isFormOpen}
          onClose={handleCloseForm}
          title={selectedNews ? 'Edit News Article' : 'Add News Article'}
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
          title="Delete News Article"
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
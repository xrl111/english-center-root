import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Container,
  Grid,
  Typography,
  TextField,
  Box,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { newsApi } from '../utils/api';
import SEO from '../components/SEO';
import ContentCard from '../components/ContentCard';
import NoData from '../components/NoData';
import LoadingOverlay from '../components/LoadingOverlay';
import FormDialog from '../components/FormDialog';
import NewsForm from '../components/NewsForm';
import useNotification, { showSuccess, showError } from '../hooks/useNotification';
import useMutation from '../hooks/useMutation';
import { formatDate } from '../utils/dateUtils';

const categories = ['All Categories', 'Announcement', 'Event', 'Update', 'Achievement'];

export default function News() {
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { showNotification, NotificationComponent } = useNotification();

  // Fetch news
  const {
    data: news,
    isLoading,
    error,
    refetch,
  } = useQuery(['news', filters], () =>
    newsApi.getAll({
      search: filters.search,
      category: filters.category === 'All Categories' ? undefined : filters.category,
    })
  );

  // Create news mutation
  const createNewsMutation = useMutation(newsApi.create, {
    onSuccess: () => {
      showSuccess(showNotification, 'News article created successfully');
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      showError(showNotification, error.message);
    },
  });

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateNews = async (values) => {
    await createNewsMutation.mutate(values);
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <SEO
        title="News & Updates"
        description="Stay updated with the latest news and announcements"
        keywords={['news', 'updates', 'announcements', 'events']}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h3" component="h1">
            News & Updates
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Add News
          </Button>
        </Box>

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              name="search"
              label="Search News"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* News List */}
        {error ? (
          <NoData
            title="Error Loading News"
            message="There was an error loading the news articles. Please try again later."
          />
        ) : news?.length > 0 ? (
          <Grid container spacing={4}>
            {news.map((article) => (
              <Grid item key={article._id} xs={12} sm={6} md={4}>
                <ContentCard
                  title={article.title}
                  description={article.content}
                  image={article.imageUrl}
                  date={formatDate(article.publishDate)}
                  category={article.category}
                  chips={article.tags}
                  link={`/news/${article._id}`}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoData
            title="No News Found"
            message="No news articles match your search criteria."
          />
        )}
      </Container>

      {/* Create News Dialog */}
      <FormDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create News Article"
        maxWidth="md"
      >
        <NewsForm
          onSubmit={handleCreateNews}
          isSubmitting={createNewsMutation.isLoading}
        />
      </FormDialog>

      <NotificationComponent />
    </>
  );
}
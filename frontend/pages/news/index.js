import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  TextField,
  MenuItem,
  InputAdornment,
  Pagination,
  Stack,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import Link from 'next/link';
import { newsApi } from '../../utils/api';
import MainLayout from '../../components/Layout/MainLayout';
import LoadingOverlay from '../../components/LoadingOverlay';
import NoData from '../../components/NoData';
import SEO from '../../components/SEO';
import { formatDate } from '../../utils/dateUtils';

const categories = [
  'All',
  'Announcement',
  'Event',
  'Course Update',
  'Blog',
  'Press Release',
];

const ITEMS_PER_PAGE = 9;

export default function NewsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const { data: news = [], isLoading } = useQuery(
    ['news', { search, category }],
    () =>
      newsApi.getAll({
        search,
        category: category === 'All' ? undefined : category,
        isPublished: true,
      })
  );

  const filteredNews = news;
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = filteredNews.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEO
        title="News & Updates"
        description="Stay updated with the latest news, announcements, and updates from our English Learning Center."
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          News & Updates
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search news..."
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                value={category}
                onChange={handleCategoryChange}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {isLoading ? (
          <LoadingOverlay />
        ) : !paginatedNews.length ? (
          <NoData message="No news articles found" />
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedNews.map((article) => (
                <Grid item xs={12} sm={6} md={4} key={article._id}>
                  <Link
                    href={`/news/${article._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      {article.imageUrl && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={article.imageUrl}
                          alt={article.title}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography
                          gutterBottom
                          variant="h6"
                          component="h2"
                          className="line-clamp-2"
                          sx={{ mb: 1 }}
                        >
                          {article.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          className="line-clamp-3"
                          sx={{ mb: 2 }}
                        >
                          {article.content}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          sx={{ mb: 1 }}
                        >
                          <Chip
                            label={article.category}
                            size="small"
                            color="primary"
                          />
                          {article.tags?.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(article.publishDate)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
}

// Use MainLayout for this page
NewsPage.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
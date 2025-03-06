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
} from '@mui/material';
import Link from 'next/link';
import MainLayout from '../../components/Layout/MainLayout';
import LoadingOverlay from '../../components/LoadingOverlay';
import { formatDate } from '../../utils/dateUtils';
import api from '../../utils/api';

export default function NewsPage() {
  const { data: news = [], isLoading } = useQuery(['news'], () =>
    api.get('/news').then((res) => res.data)
  );

  if (isLoading) return <LoadingOverlay />;

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Latest News
        </Typography>

        <Grid container spacing={3}>
          {news.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {article.imageUrl && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.imageUrl}
                    alt={article.title}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
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
                      mb: 2,
                    }}
                  >
                    {article.content}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(article.publishDate)}
                    </Typography>
                    <Button
                      component={Link}
                      href={`/news/${article._id}`}
                      size="small"
                      color="primary"
                    >
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </MainLayout>
  );
}
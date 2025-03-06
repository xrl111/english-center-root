import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '../../components/Layout/MainLayout';
import LoadingOverlay from '../../components/LoadingOverlay';
import { newsApi } from '../../utils/api';
import { formatDate } from '../../utils/dateUtils';

export default function NewsDetails() {
  const router = useRouter();
  const { id } = router.query;

  const { data: article, isLoading } = useQuery(
    ['news', id],
    () => newsApi.getById(id),
    {
      enabled: !!id,
    }
  );

  const { data: relatedArticles = [] } = useQuery(
    ['news', 'related', id],
    () => newsApi.getRelated(id),
    {
      enabled: !!id,
    }
  );

  if (isLoading) return <LoadingOverlay />;
  if (!article) return null;

  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {article.imageUrl && (
              <Box
                component="img"
                src={article.imageUrl}
                alt={article.title}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 4,
                }}
              />
            )}

            <Typography variant="h3" component="h1" gutterBottom>
              {article.title}
            </Typography>

            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {formatDate(article.publishDate)}
            </Typography>

            <Typography variant="body1" paragraph>
              {article.content}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h5" gutterBottom>
              Related Articles
            </Typography>
            <Grid container spacing={2}>
              {relatedArticles.map((relatedArticle) => (
                <Grid item xs={12} key={relatedArticle._id}>
                  <Card>
                    {relatedArticle.imageUrl && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {relatedArticle.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {relatedArticle.content}
                      </Typography>
                      <Button
                        component={Link}
                        href={`/news/${relatedArticle._id}`}
                        size="small"
                      >
                        Read More
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </MainLayout>
  );
}
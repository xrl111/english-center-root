import { Box, Container, Typography, Chip, Grid, Paper, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '../../components/Layout/MainLayout';
import LoadingOverlay from '../../components/LoadingOverlay';
import SEO from '../../components/SEO';
import { newsApi } from '../../utils/api';
import { formatDate } from '../../utils/dateUtils';

export default function NewsArticle() {
  const router = useRouter();
  const { id } = router.query;

  const { data: article, isLoading } = useQuery(
    ['news', id],
    () => newsApi.getOne(id),
    { enabled: !!id }
  );

  const { data: relatedArticles = [] } = useQuery(
    ['news', 'related', id],
    () =>
      newsApi.getAll({
        category: article?.category,
        limit: 3,
        exclude: id,
      }),
    { enabled: !!article }
  );

  if (isLoading) return <LoadingOverlay />;
  if (!article) return null;

  return (
    <>
      <SEO
        title={article.title}
        description={article.content.slice(0, 160)}
        ogImage={article.imageUrl}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 3 }}
        >
          Back to News
        </Button>

        <Paper elevation={2} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
          {/* Article header */}
          <Typography variant="h3" component="h1" gutterBottom>
            {article.title}
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Published on {formatDate(article.publishDate)}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={article.category} color="primary" />
              {article.tags?.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" />
              ))}
            </Box>
          </Box>

          {/* Featured image */}
          {article.imageUrl && (
            <Box
              sx={{
                position: 'relative',
                height: { xs: 200, sm: 400 },
                mb: 4,
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </Box>
          )}

          {/* Article content */}
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.1rem',
              lineHeight: 1.8,
              '& p': { mb: 2 },
              '& h2': { mt: 4, mb: 2 },
              '& h3': { mt: 3, mb: 2 },
              '& ul, & ol': { mb: 2, pl: 4 },
              '& li': { mb: 1 },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                pl: 2,
                py: 1,
                my: 2,
                bgcolor: 'grey.50',
              },
            }}
          >
            {article.content}
          </Typography>
        </Paper>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Related Articles
            </Typography>
            <Grid container spacing={3}>
              {relatedArticles.map((related) => (
                <Grid item xs={12} sm={6} md={4} key={related._id}>
                  <Link
                    href={`/news/${related._id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        height: '100%',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      {related.imageUrl && (
                        <Box
                          sx={{
                            position: 'relative',
                            height: 150,
                            mb: 2,
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            src={related.imageUrl}
                            alt={related.title}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </Box>
                      )}
                      <Typography
                        variant="h6"
                        className="line-clamp-2"
                        gutterBottom
                      >
                        {related.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        className="line-clamp-3"
                        paragraph
                      >
                        {related.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(related.publishDate)}
                      </Typography>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
}

// Use MainLayout for this page
NewsArticle.getLayout = function getLayout(page) {
  return <MainLayout>{page}</MainLayout>;
};
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';

const ContentCard = ({
  title,
  description,
  image,
  date,
  category,
  link,
  onEdit,
  onDelete,
  isAdmin = false,
  chips = [],
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      {image && (
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          {category && (
            <Chip
              label={category}
              color="primary"
              size="small"
              sx={{ mb: 1 }}
            />
          )}
          {chips.map((chip, index) => (
            <Chip
              key={index}
              label={chip}
              size="small"
              sx={{ ml: 1, mb: 1 }}
              variant="outlined"
            />
          ))}
        </Box>

        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
          }}
        >
          {description}
        </Typography>

        {date && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            {format(new Date(date), 'MMMM dd, yyyy')}
          </Typography>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
          }}
        >
          <Button
            component={Link}
            href={link}
            variant="contained"
            color="primary"
            startIcon={<ViewIcon />}
          >
            View Details
          </Button>

          {isAdmin && (
            <Box>
              <IconButton
                onClick={onEdit}
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={onDelete}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ContentCard;
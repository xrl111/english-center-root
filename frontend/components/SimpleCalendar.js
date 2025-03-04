import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const SimpleCalendar = ({ events = [], onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  }, [currentDate]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const getDayEvents = (day) => {
    return events.filter((event) => isSameDay(new Date(event.start), day));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Calendar Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <IconButton onClick={previousMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h5">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={nextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Week Days Header */}
      <Grid container spacing={1}>
        {weekDays.map((day) => (
          <Grid item key={day} xs>
            <Typography
              align="center"
              sx={{
                fontWeight: 'bold',
                color: 'text.secondary',
                p: 1,
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar Days */}
      <Grid container spacing={1}>
        {/* Empty cells for days before the first of the month */}
        {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, index) => (
          <Grid item xs key={`empty-${index}`}>
            <Paper
              sx={{
                p: 1,
                minHeight: 100,
                bgcolor: 'background.default',
                visibility: 'hidden',
              }}
            />
          </Grid>
        ))}

        {/* Calendar days with events */}
        {calendarDays.map((day) => {
          const dayEvents = getDayEvents(day);
          return (
            <Grid item xs key={day.toISOString()}>
              <Paper
                sx={{
                  p: 1,
                  minHeight: 100,
                  bgcolor: isSameDay(day, new Date())
                    ? 'primary.light'
                    : 'background.paper',
                }}
              >
                <Typography
                  align="right"
                  sx={{
                    color: isSameDay(day, new Date())
                      ? 'primary.contrastText'
                      : 'text.primary',
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {dayEvents.map((event) => (
                    <Tooltip
                      key={event.id}
                      title={`${event.title} - ${format(new Date(event.start), 'HH:mm')}`}
                    >
                      <Box
                        onClick={() => onEventClick(event)}
                        sx={{
                          bgcolor: event.backgroundColor || 'primary.main',
                          color: 'white',
                          p: 0.5,
                          borderRadius: 1,
                          mb: 0.5,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textDecoration: event.extendedProps?.isCanceled
                            ? 'line-through'
                            : 'none',
                          opacity: event.extendedProps?.isCanceled ? 0.7 : 1,
                          '&:hover': {
                            filter: 'brightness(0.9)',
                          },
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {format(new Date(event.start), 'HH:mm')} {event.title}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SimpleCalendar;
import { useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import FullCalendar component with no SSR
const FullCalendarComponent = dynamic(() => import('./FullCalendar'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '70vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      Loading calendar...
    </div>
  ),
});

const Calendar = ({ events = [], onEventClick, onDateSelect }) => {
  const calendarRef = useRef(null);

  return (
    <div style={{ height: '70vh', marginBottom: '2rem' }}>
      <FullCalendarComponent
        ref={calendarRef}
        events={events}
        onEventClick={onEventClick}
        onDateSelect={onDateSelect}
      />
    </div>
  );
};

export default Calendar;
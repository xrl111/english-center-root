import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const FullCalendarComponent = React.forwardRef(({ events, onEventClick, onDateSelect }, ref) => {
  const handleEventClick = (clickInfo) => {
    if (onEventClick) {
      onEventClick(clickInfo.event);
    }
  };

  const handleDateSelect = (selectInfo) => {
    if (onDateSelect) {
      onDateSelect(selectInfo);
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        ref={ref}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable={false}
        selectable={!!onDateSelect}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={events}
        eventClick={handleEventClick}
        select={handleDateSelect}
        height="100%"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false,
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false,
        }}
        eventDisplay="block"
        eventColor="#1976d2"
        nowIndicator={true}
        themeSystem="standard"
      />
    </div>
  );
});

FullCalendarComponent.displayName = 'FullCalendarComponent';

export default FullCalendarComponent;
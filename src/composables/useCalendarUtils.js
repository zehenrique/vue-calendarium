import { Temporal } from '@js-temporal/polyfill';

/**
 * Get event color styling
 */
export function getEventColorStyle(hexColor) {
  if (!hexColor) hexColor = '#1967d2';
  
  // Convert hex to RGB for lighter background
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
    color: hexColor,
    borderLeft: `3px solid ${hexColor}`
  };
}

/**
 * Format event time for display (24-hour format)
 */
export function formatEventTime(event, locale = 'en-US') {
  const start = Temporal.PlainDateTime.from(event.start);
  if (event.allDay) {
    return 'All day';
  }
  return start.toLocaleString(locale, { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Format hour for time labels (24-hour format)
 */
export function formatHour(hour, locale = 'en-US') {
  const time = Temporal.PlainTime.from({ hour });
  return time.toLocaleString(locale, { 
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Get the start of week for a given date (Monday)
 */
export function getStartOfWeek(date) {
  const dayOfWeek = date.dayOfWeek; // 1 = Monday, 7 = Sunday
  return date.subtract({ days: dayOfWeek - 1 });
}

/**
 * Get the end of week for a given date (Sunday)
 */
export function getEndOfWeek(date) {
  const startOfWeek = getStartOfWeek(date);
  return startOfWeek.add({ days: 6 });
}

/**
 * Calculate event positioning style for week/day views
 */
export function getEventStyle(event, pixelsPerHour = 60) {
  const start = Temporal.PlainDateTime.from(event.start);
  const end = event.end ? Temporal.PlainDateTime.from(event.end) : start.add({ hours: 1 });
  
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;
  const duration = endMinutes - startMinutes;
  
  const top = (startMinutes / 60) * pixelsPerHour;
  const height = (duration / 60) * pixelsPerHour;
  
  const style = {
    top: `${top}px`,
    height: `${height}px`
  };
  
  // If event has column information (from calculateEventColumns), apply it
  if (event._column !== undefined && event._totalColumns !== undefined) {
    const columnWidth = 100 / event._totalColumns;
    const leftOffset = event._column * columnWidth;
    
    style.left = `${leftOffset}%`;
    style.width = `${columnWidth - 1}%`; // -1% for small gap between columns
  }
  
  return style;
}

/**
 * Calculate overlap columns for events (Google Calendar style)
 */
export function calculateEventColumns(events) {
  if (events.length === 0) return [];
  
  // Filter out all-day events as they're handled separately
  const timedEvents = events.filter(e => !e.allDay);
  
  // Add column information to each event
  const eventsWithColumns = timedEvents.map(event => {
    const start = Temporal.PlainDateTime.from(event.start);
    const end = event.end ? Temporal.PlainDateTime.from(event.end) : start.add({ hours: 1 });
    
    return {
      ...event,
      _start: start,
      _end: end,
      _column: 0,
      _totalColumns: 1
    };
  });
  
  // Sort by start time, then by duration (longer first)
  eventsWithColumns.sort((a, b) => {
    const timeComp = Temporal.PlainDateTime.compare(a._start, b._start);
    if (timeComp !== 0) return timeComp;
    
    const durationA = Temporal.Duration.from(a._end.since(a._start)).total('minutes');
    const durationB = Temporal.Duration.from(b._end.since(b._start)).total('minutes');
    return durationB - durationA;
  });
  
  // Detect overlaps and assign columns
  for (let i = 0; i < eventsWithColumns.length; i++) {
    const current = eventsWithColumns[i];
    const overlapping = [current];
    
    // Find all events that overlap with current event
    for (let j = 0; j < eventsWithColumns.length; j++) {
      if (i === j) continue;
      const other = eventsWithColumns[j];
      
      // Check if events overlap
      const currentStartsBeforeOtherEnds = Temporal.PlainDateTime.compare(current._start, other._end) < 0;
      const currentEndsAfterOtherStarts = Temporal.PlainDateTime.compare(current._end, other._start) > 0;
      
      if (currentStartsBeforeOtherEnds && currentEndsAfterOtherStarts) {
        if (!overlapping.find(e => e.id === other.id)) {
          overlapping.push(other);
        }
      }
    }
    
    // Assign column to current event
    const usedColumns = new Set();
    for (const event of overlapping) {
      if (event.id !== current.id && event._column !== undefined) {
        usedColumns.add(event._column);
      }
    }
    
    // Find first available column
    let column = 0;
    while (usedColumns.has(column)) {
      column++;
    }
    current._column = column;
    
    // Update total columns for all overlapping events
    const maxColumns = Math.max(column + 1, ...overlapping.map(e => e._column + 1));
    for (const event of overlapping) {
      event._totalColumns = Math.min(maxColumns, 3); // Max 3 columns for readability
    }
  }
  
  return eventsWithColumns;
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(date, allEvents) {
  const events = allEvents.filter(event => {
    const eventStart = Temporal.PlainDate.from(event.start);
    const eventEnd = event.end ? Temporal.PlainDate.from(event.end) : eventStart;
    
    return Temporal.PlainDate.compare(date, eventStart) >= 0 &&
           Temporal.PlainDate.compare(date, eventEnd) <= 0;
  }).sort((a, b) => {
    const aTime = Temporal.PlainDateTime.from(a.start);
    const bTime = Temporal.PlainDateTime.from(b.start);
    return Temporal.PlainDateTime.compare(aTime, bTime);
  });
  
  return calculateEventColumns(events);
}

/**
 * Get current time position in pixels for time indicator
 */
export function getCurrentTimePosition(pixelsPerHour = 60) {
  const now = Temporal.Now.plainDateTimeISO();
  const minutesSinceMidnight = now.hour * 60 + now.minute;
  return (minutesSinceMidnight / 60) * pixelsPerHour;
}

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
    const gapPx = event._totalColumns >= 4 ? 2 : 6;

    style.left = `calc(${leftOffset}% + 2px)`;
    style.width = `calc(${columnWidth}% - ${gapPx}px)`;
    style.right = 'auto';
  } else {
    style.left = '2px';
    style.width = 'calc(100% - 4px)';
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

  // Prepare events with temporal helpers and layout metadata
  const eventsWithColumns = timedEvents.map(event => {
    const start = Temporal.PlainDateTime.from(event.start);
    const end = event.end ? Temporal.PlainDateTime.from(event.end) : start.add({ hours: 1 });

    return {
      ...event,
      _start: start,
      _end: end,
      _column: 0,
      _totalColumns: 1,
    };
  });

  // Sort by start time, then by duration (longer first) to maintain stable ordering
  eventsWithColumns.sort((a, b) => {
    const timeComp = Temporal.PlainDateTime.compare(a._start, b._start);
    if (timeComp !== 0) return timeComp;

    const durationA = Temporal.Duration.from(a._end.since(a._start)).total('minutes');
    const durationB = Temporal.Duration.from(b._end.since(b._start)).total('minutes');
    return durationB - durationA;
  });

  // Group events that overlap in time
  const groups = [];
  for (const event of eventsWithColumns) {
    let placedInGroup = false;

    for (const group of groups) {
      if (Temporal.PlainDateTime.compare(event._start, group.maxEnd) < 0) {
        group.events.push(event);
        if (Temporal.PlainDateTime.compare(event._end, group.maxEnd) > 0) {
          group.maxEnd = event._end;
        }
        placedInGroup = true;
        break;
      }
    }

    if (!placedInGroup) {
      groups.push({
        events: [event],
        maxEnd: event._end,
      });
    }
  }

  // Within each group assign columns greedily
  for (const group of groups) {
    const columnEndTimes = [];

    for (const event of group.events) {
      let assignedColumn = -1;

      for (let columnIndex = 0; columnIndex < columnEndTimes.length; columnIndex++) {
        if (Temporal.PlainDateTime.compare(event._start, columnEndTimes[columnIndex]) >= 0) {
          assignedColumn = columnIndex;
          columnEndTimes[columnIndex] = event._end;
          break;
        }
      }

      if (assignedColumn === -1) {
        columnEndTimes.push(event._end);
        assignedColumn = columnEndTimes.length - 1;
      }

      event._column = assignedColumn;
      event._totalColumns = columnEndTimes.length;
    }

    // Ensure all events in group know total columns (accounts for backtracking)
    const totalColumns = columnEndTimes.length;
    for (const event of group.events) {
      event._totalColumns = totalColumns;
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

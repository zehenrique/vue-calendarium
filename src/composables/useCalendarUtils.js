import { Temporal } from '@js-temporal/polyfill';
import { DEFAULT_COLOR } from '../config/colors.js';

/**
 * Get event color styling
 * @param {string} hexColor - The hex color code
 * @param {boolean} isPast - Whether the event is in the past
 */
export function getEventColorStyle(hexColor, isPast = false) {
  if (!hexColor) hexColor = DEFAULT_COLOR;
  
  // Validate hex color format
  if (!/^#[0-9A-F]{6}$/i.test(hexColor)) {
    hexColor = DEFAULT_COLOR;
  }
  
  // Convert hex to RGB for lighter background
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Past events get more transparency
  const bgOpacity = isPast ? 0.50 : 1;
  
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${bgOpacity})`,
    color: isPast ? '#000000' : '#ffffff',
    opacity: bgOpacity
  };
}

/**
 * Check if an event is in the past
 * @param {Object} event - The event object
 * @returns {boolean} - True if event has ended
 */
export function isEventPast(event) {
  try {
    const now = Temporal.Now.plainDateTimeISO();
    const eventEnd = event.end ? Temporal.PlainDateTime.from(event.end) : Temporal.PlainDateTime.from(event.start);
    return Temporal.PlainDateTime.compare(eventEnd, now) < 0;
  } catch (error) {
    console.error('[isEventPast] Error checking if event is past:', error, event);
    return false; // Default to not past if there's an error
  }
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
  if (event._column !== undefined && event._totalColumns !== undefined && event._columnSpan !== undefined) {
    const columnWidth = 100 / event._totalColumns;
    const leftOffset = event._column * columnWidth;
    const widthPercent = event._columnSpan * columnWidth;

    style.left = `${leftOffset}%`;
    style.width = `calc(${widthPercent}% - 2px)`;
  } else {
    style.left = '0';
    style.width = 'calc(100% - 2px)';
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
      _columnSpan: 1,
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

    // Ensure all events in group know total columns
    const totalColumns = columnEndTimes.length;
    for (const event of group.events) {
      event._totalColumns = totalColumns;
    }
    
    // Calculate column span for each event (Google Calendar style)
    // Events should expand to fill available space to their right
    for (const event of group.events) {
      let maxSpan = totalColumns - event._column;
      
      // Find events that would collide if we expand
      for (const otherEvent of group.events) {
        if (otherEvent === event) continue;
        
        // Check if events overlap in time
        const overlaps = Temporal.PlainDateTime.compare(event._start, otherEvent._end) < 0 &&
                        Temporal.PlainDateTime.compare(event._end, otherEvent._start) > 0;
        
        if (overlaps && otherEvent._column > event._column) {
          // This event blocks expansion
          const availableSpan = otherEvent._column - event._column;
          maxSpan = Math.min(maxSpan, availableSpan);
        }
      }
      
      event._columnSpan = maxSpan;
    }
  }

  return eventsWithColumns;
}

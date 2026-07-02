import { useI18n } from 'vue-i18n';

/**
 * Composable to format RRULE strings into human-readable text
 */
export function useRRuleFormatter() {
  const { t } = useI18n();

  /**
   * Convert RRULE string to human-readable description
   * @param {string} rruleStr - RRULE string (with or without RRULE: prefix)
   * @returns {string} Human-readable recurrence description
   */
  const formatRRule = (rruleStr) => {
    if (!rruleStr || rruleStr === '') {
      return t('repeatNone');
    }

    // Remove RRULE: prefix if present
    const str = rruleStr.startsWith('RRULE:') ? rruleStr.substring(6) : rruleStr;
    const parts = {};
    
    // Parse RRULE parts
    str.split(';').forEach(part => {
      const [key, value] = part.split('=');
      parts[key] = value;
    });

    const freq = parts.FREQ;
    const interval = parseInt(parts.INTERVAL || '1', 10);
    const count = parts.COUNT ? parseInt(parts.COUNT, 10) : null;
    const until = parts.UNTIL;
    const byday = parts.BYDAY;

    let description;

    // Base frequency
    if (interval === 1) {
      switch (freq) {
        case 'DAILY':
          description = t('repeatDaily');
          break;
        case 'WEEKLY':
          description = t('repeatWeekly');
          break;
        case 'MONTHLY':
          description = t('repeatMonthly');
          break;
        case 'YEARLY':
          description = t('repeatYearly');
          break;
        default:
          description = freq;
      }
    } else {
      // Custom interval
      const unitMap = {
        DAILY: t('days'),
        WEEKLY: t('weeks'),
        MONTHLY: t('months'),
        YEARLY: t('years')
      };
      description = `Every ${interval} ${unitMap[freq] || freq.toLowerCase()}`;
    }

    // Add BYDAY details for weekly
    if (freq === 'WEEKLY' && byday) {
      const dayMap = {
        SU: t('sunday'),
        MO: t('monday'),
        TU: t('tuesday'),
        WE: t('wednesday'),
        TH: t('thursday'),
        FR: t('friday'),
        SA: t('saturday')
      };
      const days = byday.split(',').map(d => dayMap[d] || d).join(', ');
      description += ` on ${days}`;
    }

    // Add end condition
    if (count) {
      description += `, ${count} times`;
    } else if (until) {
      // Format UNTIL date
      const dateStr = until.replace(/T.*/, '');
      const formatted = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      description += `, until ${formatted}`;
    }

    return description;
  };

  return {
    formatRRule
  };
}

/**
 * View factory functions
 */

export function createViewDay() {
  return {
    name: 'day',
    label: 'Day',
    type: 'day'
  };
}

export function createViewWeek() {
  return {
    name: 'week',
    label: 'Week',
    type: 'week'
  };
}

export function createViewMonth() {
  return {
    name: 'month',
    label: 'Month',
    type: 'month'
  };
}

export default {
  createViewDay,
  createViewWeek,
  createViewMonth
};

import { describe, expect, it } from 'vitest';
import * as recurrence from '../../src/recurrence.js';
import { createTranslator, describeRule, formToRule, getMonthlyOptions, getRepeatOptions, ruleToForm } from '../../src/recurrence.js';

// Wednesday 15 January 2025, the third Wednesday of the month
const START = '2025-01-15';

describe('the recurrence functions apps can import', () => {
  it('are all exported', () => {
    expect(Object.keys(recurrence).sort()).toEqual([
      'WEEKDAYS', 'addExceptionDate', 'changesRule', 'continueRuleFrom', 'createTranslator', 'describeRule',
      'endRuleBefore', 'expandRecurrence', 'formToRule', 'getExceptionDates', 'getMonthlyOptions',
      'getOccurrenceId', 'getRepeatOptions', 'getRuleParts', 'hasOccurrenceAt', 'isSameRule',
      'keepExceptionDates', 'moveRule', 'planRecurringDelete', 'planRecurringEdit', 'ruleToForm'
    ]);
  });
});

describe('ruleToForm and formToRule', () => {
  it('start a new rule weekly on the event\'s weekday, as Google Calendar does', () => {
    expect(ruleToForm('', START)).toEqual({
      frequency: 'WEEKLY', interval: 1, weekdays: ['WE'], monthlyType: 'bymonthday',
      endType: 'never', untilDate: '2025-04-15', count: 13
    });
  });

  it('read a rule and write it back', () => {
    for (const rule of [
      'FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=5',
      'FREQ=MONTHLY;BYDAY=3WE;UNTIL=20250630T235959Z',
      'FREQ=MONTHLY;BYMONTHDAY=15',
      'FREQ=DAILY'
    ]) {
      expect(formToRule(ruleToForm(rule, START), START)).toBe(rule);
    }
  });

  it('keep weekdays in order and include the end date\'s day', () => {
    const form = { ...ruleToForm('', START), weekdays: ['FR', 'MO', 'SU'], endType: 'until', untilDate: '2025-03-31' };
    expect(formToRule(form, START)).toBe('FREQ=WEEKLY;BYDAY=MO,FR,SU;UNTIL=20250331T235959Z');
  });

  it('read a rule with deleted occurrences', () => {
    expect(ruleToForm('RRULE:FREQ=WEEKLY;BYDAY=WE\nEXDATE:20250122T100000Z', START).weekdays).toEqual(['WE']);
  });
});

describe('describeRule', () => {
  it('describes rules in English and Portuguese without vue-i18n', () => {
    expect(describeRule('FREQ=WEEKLY;BYDAY=MO,WE')).toBe('Weekly on Monday, Wednesday');
    expect(describeRule('FREQ=WEEKLY;INTERVAL=2;COUNT=6')).toBe('Every 2 weeks, 6 times');
    expect(describeRule('FREQ=WEEKLY;BYDAY=WE', { locale: 'pt-PT' })).toBe('Semanalmente (quarta-feira)');
    expect(describeRule('', { locale: 'pt-PT' })).toBe('Não repetir');
  });

  it('uses the app\'s translate function when given one', () => {
    const t = (key, values) => (key === 'repeatDaily' ? 'Every day' : createTranslator('en-US')(key, values));
    expect(describeRule('FREQ=DAILY', { t })).toBe('Every day');
  });
});

describe('the repeat menu and dialog choices', () => {
  it('lists the usual rules for a date', () => {
    expect(getRepeatOptions(START)).toEqual([
      { value: 'FREQ=DAILY', title: 'Daily' },
      { value: 'FREQ=WEEKLY;BYDAY=WE', title: 'Weekly on Wednesday' },
      { value: 'FREQ=MONTHLY;BYDAY=3WE', title: 'Monthly on the third Wednesday' },
      { value: 'FREQ=YEARLY', title: 'Annually on January 15' },
      { value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', title: 'Every weekday (Monday to Friday)' }
    ]);
    expect(getRepeatOptions(START, { locale: 'pt-PT' }).map(option => option.title)[2]).toBe('Mensalmente, quarta-feira da 3.ª semana');
  });

  it('lists the monthly choices', () => {
    expect(getMonthlyOptions(START, { locale: 'pt-PT' })).toEqual([
      { value: 'bymonthday', title: 'Mensalmente no dia 15' },
      { value: 'byweekday', title: 'Mensalmente, quarta-feira da 3.ª semana' }
    ]);
  });

  it('translates plural units like vue-i18n', () => {
    const t = createTranslator('pt-PT');
    expect([t('unitWeek', 1), t('unitWeek', 3)]).toEqual(['semana', 'semanas']);
  });
});

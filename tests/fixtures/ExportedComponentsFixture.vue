<template>
  <v-app>
    <v-main class="pa-6">
      <!-- An app's own event form -->
      <p>Repeat: <RepeatSelect v-model="rrule" start-date="2025-01-15"/></p>
      <p data-testid="fixture-rule">{{ rrule }}</p>

      <v-btn data-testid="open-picker" @click="showPicker = true">Custom</v-btn>
      <RecurrencePickerModal v-model="showPicker" :rrule="rrule" start-date="2025-01-15" @save="rrule = $event"/>

      <v-btn data-testid="open-scope" @click="showScope = true">Scope</v-btn>
      <RecurrenceScopeModal v-model="showScope" :allow-this-event="true" @confirm="scope = $event" @cancel="scope = 'cancelled'"/>
      <p data-testid="fixture-scope">{{ scope }}</p>

      <!-- An app's own sidebar -->
      <div style="width: 256px">
        <MiniMonth :selected-date="selectedDate" :today="today" locale="en-US" @select="selectedDate = $event"/>
        <CalendarVisibilityList :calendars="calendars" v-model:visible-calendars="visibleCalendars"/>
      </div>
      <p data-testid="fixture-date">{{ selectedDate.toString() }}</p>
      <p data-testid="fixture-visible">{{ visibleCalendars.join(',') }}</p>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { CalendarVisibilityList, MiniMonth, RecurrencePickerModal, RecurrenceScopeModal, RepeatSelect } from '../../src/index.js';

const rrule = ref('');
const showPicker = ref(false);
const showScope = ref(false);
const scope = ref('');

const today = Temporal.PlainDate.from('2025-01-15');
const selectedDate = ref(today);
const calendars = [
  { id: 'work', name: 'Work', color: '#1967D2' },
  { id: 'home', name: 'Home', color: '#0B8043' }
];
const visibleCalendars = ref(['work', 'home']);
</script>

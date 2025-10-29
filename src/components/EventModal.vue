<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
    data-testid="event-modal"
  >
    <v-card>
      <v-card-title>
        <span>{{ t('newEvent') }}</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="handleClose" :aria-label="t('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-form>
          <!-- Event title -->
          <v-text-field
            v-model="eventData.title"
            :label="t('eventTitle')"
            :placeholder="t('eventTitle')"
            variant="outlined"
            density="comfortable"
            required
          ></v-text-field>
          
          <!-- Date and time inputs -->
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="eventData.startDate"
                :label="t('startDate')"
                type="date"
                variant="outlined"
                density="comfortable"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventData.startTime"
                :label="t('startTime')"
                type="time"
                variant="outlined"
                density="comfortable"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="eventData.endDate"
                :label="t('endDate')"
                type="date"
                variant="outlined"
                density="comfortable"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="eventData.endTime"
                :label="t('endTime')"
                type="time"
                variant="outlined"
                density="comfortable"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          
          <!-- Repeat -->
          <v-select
            v-model="eventData.repeat"
            :label="t('repeat')"
            :items="repeatOptions"
            item-title="text"
            item-value="value"
            variant="outlined"
            density="comfortable"
            data-testid="repeat-select"
          ></v-select>
          
          <!-- Calendar selection -->
          <v-select
            v-model="eventData.calendar"
            :label="t('calendar')"
            :items="calendars"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            data-testid="calendar-select"
          ></v-select>
          
          <!-- Color picker -->
          <v-row align="center">
            <v-col cols="4">
              <v-text-field
                v-model="eventData.color"
                :label="t('color')"
                type="color"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="8">
              <v-text-field
                v-model="eventData.color"
                readonly
                variant="outlined"
                density="comfortable"
                class="font-mono"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="handleClose">{{ t('cancel') }}</v-btn>
        <v-btn color="primary" variant="elevated" @click="handleSave">{{ t('save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'EventModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    event: {
      type: Object,
      default: null
    },
    calendars: {
      type: Array,
      default: () => [{ id: 'default', name: 'My Calendar', color: '#1967d2' }]
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const { t } = useI18n();
    
    const eventData = ref({
      title: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '10:00',
      repeat: 'none',
      calendar: 'default',
      color: '#1967d2'
    });

    const repeatOptions = computed(() => [
      { text: t('repeatNone'), value: 'none' },
      { text: t('repeatDaily'), value: 'daily' },
      { text: t('repeatWeekly'), value: 'weekly' },
      { text: t('repeatMonthly'), value: 'monthly' },
      { text: t('repeatYearly'), value: 'yearly' }
    ]);

    // Watch for event prop changes to update form
    watch(() => props.event, (newEvent) => {
      if (newEvent) {
        eventData.value = { ...newEvent };
      }
    }, { immediate: true, deep: true });

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    const handleSave = () => {
      if (!eventData.value.title) {
        alert('Please enter an event title');
        return;
      }
      emit('save', { ...eventData.value });
      handleClose();
    };

    return {
      t,
      eventData,
      repeatOptions,
      handleClose,
      handleSave
    };
  }
};
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ConsoleTimeline from '../lib/console_timeline';

const props = defineProps<{
  console_timeline: ConsoleTimeline;
}>();

// Use computed properties
const timelines = computed(() => props.console_timeline.timelines.value);
const selected_timeline = ref(props.console_timeline.get_selected_timeline());

const select_timeline = (index: number) => {
  props.console_timeline.select_timeline(index);
  selected_timeline.value = index;
};

const add_timeline = () => {
  const name = `Timeline Level ${timelines.value.length}`;
  props.console_timeline.add_timeline(name);
};

const remove_timeline = (index: number) => {
  props.console_timeline.remove_timeline(index);
};

const rename_timeline = (index: number, new_name: string) => {
  props.console_timeline.rename_timeline(index, new_name);
};

const move_timeline = (from_index: number, to_index: number) => {
  props.console_timeline.move_timeline(from_index, to_index);
};

const handle_rename = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  rename_timeline(index, target.value);
};
</script>

<template>
  <div class="timeline-control">
    <h3>Timelines</h3>
    <ul>
      <li v-for="(timeline, index) in timelines" :key="index">
        <input
          type="radio"
          :id="`timeline-${index}`"
          :value="index"
          v-model="selected_timeline"
          @change="select_timeline(index)"
        />
        <input
          type="text"
          v-model="timeline.title"
        />
        <button @click="move_timeline(index, index - 1)" :disabled="index === 0">
          ↑
        </button>
        <button
          @click="move_timeline(index, index + 1)"
          :disabled="index === timelines.length - 1"
        >
          ↓
        </button>
        <button @click="remove_timeline(index)" :disabled="timelines.length <= 1">
          Delete
        </button>
      </li>
    </ul>
    <button @click="add_timeline">Add Timeline</button>
  </div>
</template>

<style scoped>
.timeline-control {
  margin-top: 1rem;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin-bottom: 0.5rem;
}
</style>
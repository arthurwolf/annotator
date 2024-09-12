<script setup lang="ts">
import { ref, watch } from 'vue';
import ConsoleTimeline from '../lib/console_timeline';

const props = defineProps<{
  console_timeline: ConsoleTimeline;
}>();

const timelines = ref(props.console_timeline.get_timelines());
const selected_timeline = ref(props.console_timeline.get_selected_timeline());


watch(() => props.console_timeline.get_timelines(), (new_timelines) => {
  timelines.value = new_timelines;
});

watch(() => props.console_timeline.get_selected_timeline(), (new_selected) => {
  selected_timeline.value = new_selected;
});

const update_values = () => {
  timelines.value = props.console_timeline.get_timelines();
  selected_timeline.value = props.console_timeline.get_selected_timeline();
};

const select_timeline = (index: number) => {
  props.console_timeline.select_timeline(index);

  update_values();
};

const add_timeline = () => {
  const name = `Timeline ${timelines.value.length + 1}`;
  props.console_timeline.add_timeline(name);

  update_values();
};

const remove_timeline = (index: number) => {
  props.console_timeline.remove_timeline(index);

  update_values();
};

const rename_timeline = (index: number, new_name: string) => {
  props.console_timeline.rename_timeline(index, new_name);

  update_values();
};

const move_timeline = (from_index: number, to_index: number) => {
  props.console_timeline.move_timeline(from_index, to_index);

  update_values();
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
          :value="timeline.name"
          @input="handle_rename(index, $event)"
        />
        <button @click="move_timeline(index, index - 1)" :disabled="index === 0">
          ↑
        </button>
        <button @click="move_timeline(index, index + 1)" :disabled="index === timelines.length - 1">
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

<script lang="ts">
export default {
  name: 'TimelineControl'
}
</script>
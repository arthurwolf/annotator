<template>
    <v-dialog v-model="dialog" max-width="500">
        <v-card>
            <v-card-title class="headline">Seek to Time</v-card-title>
            
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <h4>Enter seconds directly:</h4>
                            <v-text-field
                                v-model.number="seconds_input"
                                label="Seconds"
                                type="number"
                                :min="0"
                                variant="outlined"
                                @keyup.enter="handle_seek"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                    
                    <v-row>
                        <v-col cols="12">
                            <h4>Or enter time in HH:MM:SS format:</h4>
                        </v-col>
                    </v-row>
                    
                    <v-row>
                        <v-col cols="4">
                            <v-text-field
                                v-model.number="hours_input"
                                label="Hours"
                                type="number"
                                :min="0"
                                variant="outlined"
                                @keyup.enter="handle_seek"
                            ></v-text-field>
                        </v-col>
                        
                        <v-col cols="4">
                            <v-text-field
                                v-model.number="minutes_input"
                                label="Minutes"
                                type="number"
                                :min="0"
                                :max="59"
                                variant="outlined"
                                @keyup.enter="handle_seek"
                            ></v-text-field>
                        </v-col>
                        
                        <v-col cols="4">
                            <v-text-field
                                v-model.number="seconds_hms_input"
                                label="Seconds"
                                type="number"
                                :min="0"
                                :max="59"
                                variant="outlined"
                                @keyup.enter="handle_seek"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="handle_seek">
                    Seek
                </v-btn>
                <v-btn color="primary" text @click="close_dialog">
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Component props
const props = defineProps<{
    modelValue: boolean
}>()

// Component emits
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'seek': [seconds: number]
}>()

// Local dialog state synced with v-model
const dialog = ref(props.modelValue)

// Form inputs
const seconds_input = ref<number>(0)
const hours_input = ref<number>(0)
const minutes_input = ref<number>(0)
const seconds_hms_input = ref<number>(0)

// Watch for changes to the modelValue prop
watch(() => props.modelValue, (new_value) => {
    // Update local dialog state
    dialog.value = new_value
})

// Watch for changes to the local dialog state
watch(dialog, (new_value) => {
    // Emit update to parent
    emit('update:modelValue', new_value)
})

/**
 * Calculate total seconds from the form inputs
 * @returns Total seconds to seek to
 */
const calculate_total_seconds = (): number => {
    // If direct seconds input has a value, use that
    if (seconds_input.value > 0) {
        return seconds_input.value
    }
    
    // Otherwise calculate from HMS inputs
    const hours_in_seconds = hours_input.value * 3600
    const minutes_in_seconds = minutes_input.value * 60
    const seconds = seconds_hms_input.value
    
    // Return the total
    return hours_in_seconds + minutes_in_seconds + seconds
}

/**
 * Handle the seek action
 */
const handle_seek = () => {
    // Calculate total seconds
    const total_seconds = calculate_total_seconds()
    
    // Emit seek event with the calculated seconds
    emit('seek', total_seconds)
    
    // Close the dialog
    close_dialog()
}

/**
 * Close the dialog and reset form
 */
const close_dialog = () => {
    // Close dialog
    dialog.value = false
    
    // Reset all inputs
    seconds_input.value = 0
    hours_input.value = 0
    minutes_input.value = 0
    seconds_hms_input.value = 0
}
</script>

<style scoped>
h4 {
    margin-bottom: 10px;
}
</style>
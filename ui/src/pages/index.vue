<template>
    <!-- Container for UI components -->
    <v-container fluid class="pa-0 ma-0" style="width: 100vw; height: auto;">
        <v-card class="ma-0 pa-0" elevation="16" style="width: 100%; height: auto;">
            <v-row>
                <v-col>
                    <v-card-item>
                        <v-card-text>
                            <div id="player"></div>
                        </v-card-text>

                        <v-card-text>
                            <v-container>
                                <!-- Hidden file input field for handling file selection -->
                                <input type="file" ref="file_input" @change="handle_file_upload" style="display:none" />

                                <v-row align="center" justify="center">
                                    <v-col cols="auto">
                                        <v-tooltip location="bottom" text="Upload an Asciinema recording file.">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon="mdi-upload" size="large" @click="on_upload_click" :disabled="console_player?.loaded.value">
                                                </v-btn>
                                            </template>
                                        </v-tooltip>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-play" size="large" @click="console_player.play()" :disabled="console_player?.playing.value">
                                            <v-icon>mdi-play</v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Start playing.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-pause" size="large" @click="console_player.pause()" :disabled="!console_player?.playing.value">
                                            <v-icon>mdi-pause</v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Pause playing.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn color="red-darken-2" icon="mdi-alpha-a-circle" size="large" @click="console_timeline.set_a()">
                                            <v-icon icon="mdi-alpha-a-circle-outline" color="black"></v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Set beginning keyframe for new annotation.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn color="light-green-darken-2" icon="mdi-alpha-b-circle-outline" size="large" @click="console_timeline.set_b()">
                                            <v-icon color="black" icon="mdi-alpha-b-circle"></v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Set ending keyframe for new annotation.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-tag-plus-outline" size="large" @click="console_timeline.new_annotation()">
                                            <v-icon icon="mdi-tag-plus"></v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Create a new annotation based on the set beginning (A) and ending (B) keyframes/positions.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-cursor-default" :disabled="console_timeline.is_mode_pan" size="large" @click="console_timeline.set_mode('pan')">
                                            <v-icon icon="mdi-cursor-default"></v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Set the timeline into <strong>pan/select</strong> mode.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-magnify-plus-outline" :disabled="console_timeline.is_mode_zoom" size="large" @click="console_timeline.set_mode('zoom')">
                                            <v-icon icon="mdi-magnify-plus-outline"></v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Set the timeline into <strong>zoom</strong> mode.<br>
                                                <strong>Click</strong> to zoom in, <strong>ctrl+click</strong> to zoom out.<br>
                                                Or use <strong>ctrl</strong> + <strong>mouse wheel</strong>.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-pan" :disabled="console_timeline.is_mode_non_interactive_pan" size="large" @click="console_timeline.set_mode('nonInteractivePan')">
                                            <v-icon icon="mdi-pan"></v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Set the timeline into <strong>non-interactive</strong> (no selection) <strong>pan</strong> mode.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-select-drag" :disabled="console_timeline.is_mode_selection" size="large" @click="console_timeline.set_mode('selection')">
                                            <v-icon icon="mdi-select-drag"></v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Set the timeline into <strong>selection</strong> mode.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-download" size="large" @click="console_timeline.download()">
                                            <v-icon icon="mdi-download"></v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Download the annotated asciinema file.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <!-- New Buttons for skipping to the next/previous activity -->
                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-skip-previous" size="large" @click="console_timeline.skip_over_inactivity(false)">
                                            <v-icon>mdi-skip-previous</v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Skip to previous activity.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="auto" v-show="file_loaded">
                                        <v-btn icon="mdi-skip-next" size="large" @click="console_timeline.skip_over_inactivity()">
                                            <v-icon>mdi-skip-next</v-icon>
                                            <v-tooltip activator="parent" location="bottom">
                                                Skip past inactivity.
                                            </v-tooltip>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                    </v-card-item>
                </v-col>

                <v-col>
                    <v-card-item>
                        <div id="timeline" v-show="file_loaded"></div>

                        <v-card-title v-show="file_loaded">
                            Annotation text.
                        </v-card-title>

                        <v-card-text v-show="file_loaded">
                            <textarea
                                id="annotation"
                                @keyup="text_changed"
                                style="border: 1px dotted white; width: 100%"
                                class="mt-3 pa-1"
                            ></textarea>
                        </v-card-text>

                        <v-card-title v-show="file_loaded">Timelines.</v-card-title>

                        <v-card-text v-show="file_loaded">
                            <TimelineControl v-if="console_timeline" :console_timeline="console_timeline" />
                        </v-card-text>

                        <v-card-title>Debug.</v-card-title>

                        <v-card-text>
                            <pre>{{ debug }}</pre>
                        </v-card-text>
                    </v-card-item>

                    <v-card-item style="width: 100%">
                        <v-card-title>Documentation.</v-card-title>

                        <v-card-text style="width: 100%">
                            <ul>
                                <li><strong><pre>A</pre></strong> key: set marker A.</li>
                                <li><strong><pre>B</pre></strong> key: set marker B.</li>
                                <li><strong><pre>C</pre></strong> key: create new annotation.</li>
                                <li><strong><pre>Space</pre></strong> key: toggle play/pause.</li>
                                <li><strong><pre>Delete</pre></strong> key: delete annotation at current position in current row.</li>
                                <li><strong><pre>ctrl + Right</pre></strong> key: skip over inactivity.</li>
                                <li><strong><pre>ctrl + Left</pre></strong> key: skip over inactivity backwards.</li>
                                <li><strong><pre>Up</pre></strong> key: skip to next annotation.</li>
                                <li><strong><pre>Down</pre></strong> key: skip to previous annotation.</li>
                            </ul>
                        </v-card-text>
                    </v-card-item>
                </v-col>
            </v-row>
        </v-card>


        <!-- Vuetify dialog for the previous session prompt -->
        <v-dialog v-model="show_previous_session_dialog" max-width="500">
            <v-card>
                <v-card-title class="headline">Continue Previous Session?</v-card-title>
                <v-card-text>
                    Do you want to continue from the previous session?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="continue_previous_session">
                        Yes
                    </v-btn>
                    <v-btn color="primary" text @click="discard_previous_session">
                        No
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>


</template>

<script setup lang="ts">

// Imports.
import { Ref, ref, onMounted, onUnmounted, nextTick }                                        from 'vue';

// Our classes.
import ConsolePlayer   from '../lib/console_player'
import ConsoleTimeline from '../lib/console_timeline'

// @ts-ignore
import TimelineControl from '../components/TimelineControl.vue'

// Make a new ConsolePlayer instance.
const console_player: ConsolePlayer = new ConsolePlayer()

// Make a new ConsoleTimeline instance.
const console_timeline : ConsoleTimeline = new ConsoleTimeline(console_player);

// Initialize a ref for the file input element
const file_input = ref<HTMLInputElement | null>(null);

// Debug info.
let debug : Ref<string> = ref('');

// Flag for whether a file is loaded or not.
let file_loaded : Ref<boolean> = ref(false);

// Reactive variable to control the visibility of the dialog
const show_previous_session_dialog = ref(false);

// Delete at the current position.
function key_press_delete(){

    // Delete.
    console_timeline.delete_at_current_position();

}

// The "space" key was pressed, if the player is playing, pause it, if it's paused, play.
function key_press_space() {

    // If the player is playing, pause it.
    if (console_player.playing.value) console_player.pause();

    // If the player is paused, play it.
    else console_player.play();

}


// The "end" key was pressed.
function key_press_end() {

    // Get the end position and seek to it.
    const end_position : number = console_player.seek_to_end();

    // Move the timeline to the end position.
    console_timeline.set_time(end_position);

    // Play the player.
    console_player.play();

}

// The "A" key was pressed.
function key_press_a() {

    // Set the A keyframe.
    console_timeline.set_a();

}

// The "B" key was pressed.
function key_press_b() {

    // Set the B keyframe.
    console_timeline.set_b();

}

// The "C" key was pressed, "create" a new annotation.
function key_press_c() {

    // Create a new annotation.
    console_timeline.new_annotation();

}

function key_press_ctrl_right() {
    console_timeline.skip_over_inactivity();
}

function key_press_ctrl_left() {
    console_timeline.skip_over_inactivity(false);
}

function key_press_up() {
    console_timeline.skip_to_next_annotation();
}

function key_press_down() {
    console_timeline.skip_to_previous_annotation();
}

// Function triggered on button click to activate file input
function on_upload_click() {

    // Trigger the hidden file input to open the file dialog
    file_input.value?.click();
}

// Function to handle the file selection from the input
async function handle_file_upload(event: Event) {

    // Obtain the file(s) from the event target
    const files = (event.target as HTMLInputElement).files;
    
    // Check if files are selected
    if (files && files.length > 0) {

        // Take the first file from the file list
        const file = files[0];

        // Call the function to read the file as text
        const data : string = await read_as_text(file);

        // Call the setup_player function with the file content.
        console_player.setup(data);

        // Set the file loaded flag.
        file_loaded.value = true;

        // Await nexttick. 
        // This is required so there is an element in the DOM for the timeline to bind to.
        await nextTick();

        // Same thing for the console timeline, if we have data.
        await console_timeline.attempt_data_import(data);

        // Save into local storage
        localStorage.setItem("previous_session", data);

    }
}


// Function to asynchronously read a file and log its content
async function read_as_text(file: File) : Promise<string> {

    // Create a FileReader instance
    const reader = new FileReader();

    // Promise to handle the file reading completion
    const readPromise = new Promise<string | ArrayBuffer | null>((resolve, reject) => {
        
        // Set up the onload event handler to resolve the promise with the reader's result
        reader.onload = () => resolve(reader.result);

        // Set up the onerror event handler to reject the promise in case of an error
        reader.onerror = () => reject(reader.error);
    });

    // Read the file as text
    reader.readAsText(file);

    // Await the promise to get the file content
    try {
        // Wait for the file reading to complete
        const content = await readPromise;

        // Define a variable to store the text content of the file
        const text = content as string;

        // Return the text we found.
        return text;

    } catch (error) {
        // Handle errors, such as file read errors
        console.error('Error reading file:', error);
    }

    // Return nothing.
    return '';
}

// Define the event handler function
const keydownHandler = (event: KeyboardEvent) => {

    // Get the annotation input element.
    const annotation_input = document.getElementById('annotation');

    // If the active element is the annotation input, return.
    if (document.activeElement === annotation_input) return;

    switch (event.key) {
        case ' ':
            event.preventDefault();
            key_press_space();
            break;
        case 'End':
            event.preventDefault();
            key_press_end();
            break;
        case 'a':
        case 'A':
            key_press_a();
            break;
        case 'b':
        case 'B':
            key_press_b();
            break;
        case 'c':
        case 'C':
            key_press_c();
            break;
        case 'Delete':
            key_press_delete();
            break;
        case 'ArrowRight':
            if (event.ctrlKey) {
            event.preventDefault();
            key_press_ctrl_right();
            }
            break;
        case 'ArrowLeft':
            if (event.ctrlKey) {
            event.preventDefault();
            key_press_ctrl_left();
            }
            break;
        case 'ArrowUp':
            event.preventDefault();
            key_press_up();
            break;
        case 'ArrowDown':
            event.preventDefault();
            key_press_down();
            break;
        default:
            break;
    }

};

// On mounted hook
onMounted(async () => {

    // Get the previous session from local storage.
    const previous_session = localStorage.getItem("previous_session");

    // If there is a previous session, show the dialog.
    if (previous_session) show_previous_session_dialog.value = true;

    // Set up the timeline selection event.
    console_timeline.on_selection((selection) => {

        // Get the textarea.
        const textarea = document.getElementById('annotation') as HTMLInputElement;

        // If there is no selection, return.
        if (!selection){
            textarea.value = '';   
            return;
        }

        // Get the text.
        const text = selection.first_keyframe.text ?? 'no text';

        // Set the text.
        textarea.value = text;

    });

    // Add the keydown event listener.
    window.addEventListener('keydown', keydownHandler);

});

// On unmounted hook
onUnmounted(() => {
    window.removeEventListener('keydown', keydownHandler);
});

// Function to handle the textarea text change.
function text_changed(event) {

    // Set the text.
    console_timeline.set_text(event?.target?.value)

}

// Methods to handle the user's response to the dialog
async function continue_previous_session() {

    // Get the previous session from local storage.
    const previous_session = localStorage.getItem("previous_session");

    // If there is a previous session, setup the player and timeline.
    if (previous_session) {

        // Set the file loaded flag.
        file_loaded.value = true;
        
        // Await nexttick. 
        // This is required so there is an element in the DOM for the timeline to bind to.
        await nextTick();

        // Setup the player and timeline.
        console_player.setup(previous_session);

        // Attempt to import the data.
        await console_timeline.attempt_data_import(previous_session);

    }

    // Hide the dialog.
    show_previous_session_dialog.value = false;
}

// Function to handle the user's response to the dialog
function discard_previous_session() {
    // Remove the previous session from local storage.
    localStorage.removeItem("previous_session");

    // Hide the dialog.
    show_previous_session_dialog.value = false;
}

</script>

<style scoped lang="sass">
// Define component-specific styles here

#timeline
    width            : 100%
    height           : 160px
    background-color : #f0f0f0
    border           : 1px solid #222

</style>
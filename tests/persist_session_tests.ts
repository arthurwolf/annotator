// This test can be run using "bun persist_session_test.ts"

// Import the actual file_loaded and load_session from index.vue
import { load_session } from '../ui/src/lib/persist_session.ts';


// Create mockups for console_player, console_timeline, file_loaded, and localStorage
const console_player = {
    setup: function(previous_session) {}
}

const console_timeline = {
    attempt_data_import: function(previous_session) {}
}

const file_loaded = {
    value: false
}

global.localStorage = {
    store: {},
    getItem(key) {
        return this.store[key] || null;
    },
    setItem(key, value) {
        this.store[key] = value;
    },
    removeItem(key) {
        delete this.store[key];
    }
}

// Test case 1: Check if session data is properly loaded by load_session()
async function test_case_1() {
    localStorage.setItem("previous_session", "some data");
    await load_session(console_player, console_timeline, file_loaded);
    console.log("Test Case 1 - load_session with valid session data: ", file_loaded.value ? "success" : "fail");
    // Reset for next test
    localStorage.removeItem("previous_session", "some data");
    file_loaded.value = false; 
}

// Test case 2: Check if load_session handles missing session data
async function test_case_2() {
    await load_session(console_player, console_timeline, file_loaded);
    console.log("Test Case 2 - load_session with no session data: ", !file_loaded.value ? "success" : "fail");
    file_loaded.value = false; // in case value is true for some reason
}

// Run the tests
test_case_1();
test_case_2();

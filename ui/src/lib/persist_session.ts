// Functions used for the persist session feature

import ConsolePlayer from "./console_player";
import ConsoleTimeline from "./console_timeline";
import { Ref } from 'vue';

// Show the "Would you like to continue from your previous session?"popup after a refresh
export function show_popup(console_player: ConsolePlayer, console_timeline: ConsoleTimeline, file_loaded: Ref<boolean>) {
    const result = confirm("Do you want to continue from the previous session?");
    if (result) load_session(console_player, console_timeline, file_loaded);
    else localStorage.setItem("previous_session", "");
}

// when "Yes" is clicked in the confirm popup
export async function load_session(console_player: ConsolePlayer, console_timeline: ConsoleTimeline, file_loaded: Ref<boolean>) {
    const previous_session = localStorage.getItem("previous_session");
    if (previous_session) {
        console_player.setup(previous_session);
        await console_timeline.attempt_data_import(previous_session);
        file_loaded.value = true;
    }
}
// Class abstraction for the console player, interface between the asciinema player and our code.

// Imports.
import * as AsciinemaPlayer  from 'asciinema-player';
import { ref }               from 'vue';

// Ours.

// Class.
export default class ConsolePlayer {

    // Properties.
    private _player : AsciinemaPlayer.Player | null = null;
    public   playing = ref<boolean>(false);
    public   loaded  = ref<boolean>(false);
    private _data   : string|null = null;

    // Constructor.
    constructor() {
    }

    // Getter for the player's current time.
    get current_time(){
        return this._player?.getCurrentTime() || 0;
    }

    // Getter for the current data.
    get data(){
        return this._data;
    }

    // Passthrough for "play".
    play(){this._player?.play() }

    // Passthrough for "pause".
    pause(){ this._player?.pause() }

    // Setup method, receives the data to be played.
    async setup(data:string){

        // Store the data.
        this._data = data;

        // Create an Asciinema player instance
        this._player = AsciinemaPlayer.create({data}, document.getElementById('player'));

        // Play.
        // this._player.play();

        // Mark the player as playing.
        this.playing.value = true;

        // Mark the player as loaded.
        this.loaded.value = true;

        // Listen for "play" events, happening when the player starts playing.
        this._player.addEventListener('play', () => {
            
            // Mark the player as playing.
            this.playing.value = true;

        });

        // Listen for "pause" events, happening when the player is paused.
        this._player.addEventListener('pause', () => {

            // Mark the player as not playing.
            this.playing.value = false;

        });

    }

    // Seek method, with the time in seconds.
    seek(time:number){

        // If the player is not defined, exit.
        if(!this._player) return;

        // Seek.
        this._player?.seek(time);

    }

    // Seek to end: get the length of the recording, seek to one second before that, and return that position.
    seek_to_end(){

        // Get the length of the recording.
        const length = this._player?.getDuration() || 0;

        // Seek to one second before the end.
        this._player?.seek(length - 1);

        // Return the current time.
        return (this._player?.getCurrentTime() || 1) - 1;

    }
 
    // Debug method.
    debug(){
        return {
            current_time: this.current_time,
            playing: this.playing.value,
            loaded: this.loaded.value,
            data: this._data
        };
    }

    



}
// Class abstraction for the console timeline, interface between animation-timeline-js and our code.

// Imports.
import ConsolePlayer                                          from "./console_player";
import { ref }                                                from 'vue';

// @ts-ignore TODO: Fix this, this is due to importing the local copy of the lib in a weird way.
import { Timeline, TimelineInteractionMode, TimelineModel }   from "./animation-timeline-js/src/animation-timeline.ts";

// Ours.

// Types.
type Annotation = {
    group: string;
    beginning: number;
    end: number;
    text?: string; // text is optional as it's not always set
};

type Layer = {
    annotations: Annotation[];
};

type ExportData = {
    note: string;
    version: number;
    layers: Layer[];
};

// Class.
export default class ConsoleTimeline {

    // Properties.
    private _timeline : Timeline | null = null;
    private _model : TimelineModel | null = null;
    private _player : ConsolePlayer;
    public mode = ref<string>('pan');
    private _a : number|null = null;
    private _b : number|null = null;
    private _selected_level_of_detail : number = 0;
    private _selection_callback : Function|null = null;


    // Constructor.
    constructor(player:ConsolePlayer) {

        // Set the player.
        this._player = player;

    }

    // Debug info.
    debug(){
        return {
            playing      : this.playing,
            mode         : this.mode.value,
            a            : this._a,
            b            : this._b,
            current_time : this._player.current_time,
        }
    }

    // Getter for the player's playing.
    get playing(){
        return this._player.playing.value;
    }

    // Attempt importing data from a file.
    async attempt_data_import(data:string){

        // Split the data into lines.
        const lines = data.split('\n');

        // Attempt to parse the first line as JSON.
        const first_line_json = JSON.parse(lines[0]);

        // If it does not have the librecode_annotations key, setup with a default model.
        if(!first_line_json.librecode_annotations){

            // Setup with a default model.
            await this.setup({ rows: 
                [
                    { keyframes: [] },
                    { keyframes: [] },
                    { keyframes: [] },
                ] 
            });

            // Return.
            return;

        }

        // Parse the annotations.
        const export_data = first_line_json.librecode_annotations;

        // Convert the export data back into model format.
        const model = this.export_to_model(export_data);

        // Setup with the model.
        await this.setup(model);

    }

    // Setup method, receives the model to be displayed.
    async setup(model:TimelineModel){

        // Create the global timeline object.
        this._timeline = new Timeline({id:'timeline'});

        // Set the original detail level/row.
        this.set_detail('near');

        // Set the model.
        this._model = model;

        // Set up the timeline model (data).
        // TODO: Get this from the file if the data is in the file.
        this._timeline.setModel(this._model);

        // When the time changes (event)
        this._timeline.onTimeChanged((args: any) => {

            // If the player is playing, exit.
            if(this.playing) return;

            // If the source is not the user, exit.
            if(args.source != 'user') return;

            // Get the time in milliseconds.
            const time_ms : number = args.val

            // Set the time in the player.
            this._player?.seek(time_ms/1000);

            // Call the selection callback.
            if(this._selection_callback) this._selection_callback(this.get_selected_annotation(time_ms/1000));

        });

        // When a keyframe is selected.
        this._timeline.onSelected((args: any) => {
            console.log(`Selected keyframe:`);
            console.log(args);
        });

        this._timeline.onMouseDown((args: any) => {
            console.log(`Mouse down:`);
            console.log(args);
        });


        // Set up a timer for 10fps.
        await setInterval(async () => {

            // Update the timeline.
            await this.update_timeline();

        }, 1000 / 10);

    }

    // Set the time of the timeline.
    set_time(time:number){

        // TODO: Currently this doesn't "move" the current window to the position of the "new" current position, we should improve that.

        // Set the time.
        if(this._timeline){
            
            this._timeline.setTime(time*1000);

            // Test.
            //this._timeline.scrollToRightBounds()

            //this._timeline.redraw();

            //this._timeline.rescale();

        }

    }

    // Method to find the group and first keyframe based on a time.
    find_group_and_first_keyframe(time: number) {

        // Search function.
        const search = (keyframes, time: number) => {

            // First, sort the keyframes by group and val (time) to ensure they are in order
            keyframes.sort((a, b) => a.group.localeCompare(b.group) || a.val - b.val);
        
            // Filter to find matching groups
            const filtered_groups = keyframes.filter(kf => kf.val <= time).reverse();
            for (const keyframe of filtered_groups) {
                const group_keyframes = keyframes.filter(k => k.group === keyframe.group);
                const last_keyframe = group_keyframes[group_keyframes.length - 1];
                if (last_keyframe.val > time) {
                    const first_keyframe = group_keyframes[0];
                    return { group: keyframe.group, first_keyframe: first_keyframe };
                }
            }

            // If no group matches the criteria, return null
            return null;
        }

        // Get the right row based on which row is selected.
        const row = this._model?.rows[this._selected_level_of_detail];

        // Search and return what we found.
        return search(row?.keyframes, time*1000);

    }

    // Get the selected annotation.
    get_selected_annotation(time:number){

        return this.find_group_and_first_keyframe(time);

    }

    // Set the text of the currently selected keyframe/group.
    set_text(text:string){

        // Get the currently selected time.
        const time : number = this._player.current_time;

        console.log({set_text_time: time, text, model: this._model});

        const found = this.find_group_and_first_keyframe(time);

        // Set the value.
        if(found) found.first_keyframe.text = text;

    }

    // Set the selection callback.
    on_selection(callback:Function){
        this._selection_callback = callback;
    }

    // Set the current level of detail.
    set_detail(level:string){

        // Change based on the level.
        if(level == 'near'  ) this._selected_level_of_detail = 0;
        if(level == 'medium') this._selected_level_of_detail = 1;
        if(level == 'far'   ) this._selected_level_of_detail = 2;

        // Update the player's selected row.
        if(this._timeline){
            
            // Set the selected row.
            this._timeline.selected_row = this._selected_level_of_detail;

            // Redraw it.
            this._timeline.redraw();
        }

    }

    // Update the timeline.
    async update_timeline(){

        // If the player is not playing, we have nothing to do here.
        if(!this.playing) return;

        // Get the current time from the player.
        const current_time : number = this._player.current_time;

        // Set the timeline time (note that the timeline time is in milliseconds, while the player time is in seconds)
        this._timeline?.setTime(current_time*1000);

    }

    // Method to set the mode.
    set_mode(mode:string){

        // If the timeline is not defined, exit.
        if(!this._timeline) return;

        // Set the mode.
        this._timeline.setInteractionMode(mode as TimelineInteractionMode);

        // Remember the mode.
        this.mode.value = mode;

    }

    // Set the A value.
    set_a(){

        // Set the A value.
        this._a = this._player.current_time;

        console.log({a: this._a});

        if(this._a && this._timeline) this._timeline.position_a = this._a * 1000;
        if(this._timeline) this._timeline.redraw();


    }

    // Set the B value.
    set_b(){

        // Set the B value.
        this._b = this._player.current_time;

        console.log({b: this._b})

        if(this._b && this._timeline) this._timeline.position_b = this._b * 1000;
        if(this._timeline) this._timeline.redraw();


    }

    // Download the annotated file.
    async download(){

        // Log.
        console.log(`# Download.`);
        console.log({model:this._model});

        // Make JSON from the model.
        const json = JSON.stringify(this._model);

        // Make a sha hash of the JSON.
        const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json)))).map(b => b.toString(16).padStart(2, '0')).join('');

        // Log.
        console.log({json, hash: hash.toString(), length: json.length});

        // Convert the model to the export format.
        const export_data = this.model_to_export(this._model as any);

        // Log.
        console.log({export_data});

        // Convert the export data back into model format.
        const model = this.export_to_model(export_data);

        // Log.
        console.log({model});

        // Make a JSON of the from-export model.
        const json2 = JSON.stringify(model);

        // Make a sha hash of the JSON.
        const hash2 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json2)))).map(b => b.toString(16).padStart(2, '0')).join('');

        // Log.
        console.log({json2, hash2, length2: json2.length});

        // Get the player's data.
        const file_data : string = this._player.data ?? '';

        // Get the data as lines.
        const lines : string[] = file_data.split('\n');

        // Log it.
        console.log({lines});

        // Parse the first line as JSON.
        const first_line_json = JSON.parse(lines[0]);

        // Add the annotation to the first line.
        first_line_json['librecode_annotations'] = export_data;

        // Stringify the first line JSON.
        lines[0] = JSON.stringify(first_line_json);

        // Join the lines back together as data.
        const modified_data : string = lines.join('\n');

        // Log it.
        console.log({data2: modified_data});

        // Create a blob with the date
        const modified_data_blob = new Blob([modified_data], { type: 'text/plain' });

        // Create a URL for the blob
        const modified_data_file_url = URL.createObjectURL(modified_data_blob);

        // Create a temporary <a> element to trigger download
        const download_link = document.createElement('a');
        download_link.href = modified_data_file_url;
        download_link.download = 'new_file.asciinema.annotated'; // Set the download file name

        // Append link to the body, trigger click to download, and then remove the link
        document.body.appendChild(download_link);
        download_link.click();
        document.body.removeChild(download_link);

        // Clean up the blob URL
        URL.revokeObjectURL(modified_data_file_url);

    }

    // Convert the export data back into the TimelineModel format.
    export_to_model(export_data: ExportData): TimelineModel {
        // Initialize a new model object.
        const model: TimelineModel = {
            rows: []
        };

        // Loop through each layer in the export data.
        for (const layer of export_data.layers) {
            // Initialize a row with an empty array of keyframes.
            const row: any = {
                keyframes: []
            };

            // Loop through each annotation in the layer.
            for (const annotation of layer.annotations) {
                // Push the beginning keyframe for each group.
                row.keyframes.push({
                    group: annotation.group,
                    val: annotation.beginning,
                    text: annotation.text  // Include the text if available.
                });

                // Push the ending keyframe for each group.
                row.keyframes.push({
                    group: annotation.group,
                    val: annotation.end  // No text for ending keyframe.
                });
            }

            // Sort keyframes by the 'val' to maintain chronological order.
            row.keyframes.sort((a, b) => a.val - b.val);

            // Add the row to the model's rows array.
            model.rows.push(row);
        }

        // Return the reconstructed TimelineModel.
        return model;
    }


    // Convert the model to the export format.
    model_to_export(model:TimelineModel){

        // Create the export object.
        const export_data : ExportData = {
            note: "librecode annotations",
            version: 1,
            layers: [],
        };

        // Go through the rows.
        for(const row of model.rows){

            // Create the layer.
            const layer : Layer = {
                annotations: [],
            };

            // List of group names.
            const groups : string[] = [];

            if(row.keyframes){ 

                // Go through the keyframes, find a list of all the groups.
                for(const keyframe of row.keyframes){

                    // If the group is not in the list, add it.
                    if(!groups.includes(keyframe.group as string)) groups.push(keyframe.group as string);

                }

            }

            // Go through the groups.
            for(const group of groups){

                // Skip if row.keyframes is null.
                if(!row.keyframes) continue;

                // Create the annotation.
                const annotation : Annotation = {
                    group     : group,
                    beginning : Math.min(...row.keyframes.filter(k => k.group == group).map(k => k.val)),
                    end       : Math.max(...row.keyframes.filter(k => k.group == group).map(k => k.val)),
                };

                // Get the text of the beginning keyframe.
                const beginning_keyframe = row.keyframes.find(k => k.group == group && k.val == annotation.beginning);

                // If the keyframe is found, set the text.
                if(beginning_keyframe) annotation.text = (beginning_keyframe as any).text;

                // Add the annotation to the layer.
                layer.annotations.push(annotation);

            }

            // Add the layer to the export data.
            export_data.layers.push(layer);

        }

        // Return the export data.
        return export_data;

    }

    // Create a new annotation.
    new_annotation(){

        // Using only methods available in the browser, generate a sha256 unique ID.
        const id = crypto.getRandomValues(new Uint32Array(4)).join('-');

        console.log(this);

        // For the beginning time, use A if it's set, use the end of the previous annotation if it's not.
        const beginning_time : number = this._a ?? 0;

        // For the end time, use B if it's set, use the current time if it's not.
        const end_time : number = this._b ?? this._player.current_time;

        console.log({beginning_time, end_time, a: this._a, b: this._b});

        // Create the annotation.
        this._model?.rows[this._selected_level_of_detail]?.keyframes?.push(
            {val: beginning_time * 1000, group: id}, 
            {val: end_time       * 1000, group: id}
        );

        console.log(this._model);

        // Update the model.
        if(this._model) this._timeline?.setModel(this._model);

        // Reset A and B.
        this._a = null;
        this._b = null;

        // Reset the timeline's A and B.
        if(this._timeline) this._timeline.position_a = null;
        if(this._timeline) this._timeline.position_b = null;
        if(this._timeline) this._timeline.redraw();

/*
import { TimelineModel }                                              from "animation-timeline-js";-js";-js";-js";-js";-js";-js";-js";-js";-js";

    // Getters for the different possible modes.
    public get is_mode_pan(                ){ return this.mode.value == 'pan'              ; }
import ConsolePlayer                                                  from '../lib/console_player';yer';yer';yer';yer';yer';yer';yer';yer';yer';
import ConsoleTimeline                                                from '../lib/console_timeline';ine';ine';ine';ine';ine';ine';ine';ine';ine';
    public get is_mode_non_interactive_pan(){ return this.mode.value == 'nonInteractivePan'; }

*/
    }

    public get is_mode_pan(                ){ return this.mode.value == 'pan'              ; }
    public get is_mode_non_interactive_pan(){ return this.mode.value == 'nonInteractivePan'; }
    public get is_mode_zoom(               ){ return this.mode.value == 'zoom'             ; }
    public get is_mode_selection(          ){ return this.mode.value == 'selection'        ; }

}
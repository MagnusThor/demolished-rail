import { IEntity } from '../../../../src';

/**
 * Represents the structure of a demo configuration.
 */
export interface IDemo {
    /**
     * Audio-related properties of the demo.
     */
    audio: {
        /**
         * The source URL or path of the audio file.
         */
        src: string;

        /**
         * The beats per minute (BPM) of the audio.
         */
        bpm: number;

        /**
         * The number of ticks in the audio.
         */
        ticks: number;

        /**
         * The beats per bar (BPB) of the audio.
         */
        bpb: number;
    };

    /**
     * Graphics-related properties of the demo.
     */
    graphics: {
        /**
         * An array of texture file paths or URLs.
         */
        textures: string[];
    };

    /**
     * An array of scenes included in the demo.
     */
    scenes: {
        /**
         * The index of the scene.
         */
        index: number;

        /**
         * The name of the scene.
         */
        name: string;

        /**
         * The duration of the scene in seconds. Can be undefined if not specified.
         */
        duration: number | undefined;

        /**
         * An array of entities present in the scene.
         */
        entities: IEntity[] ;

        
        timers?: [{
            key: string;
            startTime: number;
            duration: number;
        }]

        /**
         * A map of uniform variables for the scene, if any.
         */
        uniforms?: Map<string, any>;
    }[];
}

import { Entity } from "./entity";
import { Sequence } from "./sequence";

export interface ITimelineEvent<T, P> {
    time?: number;        // Time in milliseconds
    beatCount?: number;   // Beat count
    barCount?: number;    // Bar count
    action: (entity: Entity<T>, eventProps: P) => void;
    targetEntity: string;   // Key of the entity to target
    criteria?: () => boolean; // Optional criteria function
    props?: any;            // Optional properties for the event
}

export class Conductor { // Using Conductor as the class name
    private events: ITimelineEvent<any, any>[] = [];
    public currentTime: number = 0;

    /**
     * Adds an event to the timeline.
     * @param event - The event to add.
     */
    addEvent<T, P>(event: ITimelineEvent<T, P>) { // Add type parameter P
        this.events.push(event);
    }


    /**
     * Updates the current time of the timeline.
     * @param time - The current time in milliseconds.
     */
    updateTime(time: number) {
        this.currentTime = time;
    }

    /**
     * Triggers events on the timeline based on the current time, beat count, and bar count.
     * @param sequence - The Sequence instance to get timing information from.
     */
    triggerEvents(sequence: Sequence) {
        this.events.forEach(event => {
            const { time, beatCount, barCount, action, targetEntity, criteria, props } = event;

            // Check if the event should be triggered based on time, beat, bar, and criteria
            if (
                (time !== undefined && this.currentTime >= time) ||
                (beatCount !== undefined && sequence.beatCounter >= beatCount) ||
                (barCount !== undefined && sequence.currentBar >= barCount)
            ) {
                if (!criteria || criteria()) {
                    const entity = sequence.currentScene?.entities.find(e => e.name === targetEntity);
                    if (entity instanceof Entity) {
                        action(entity, props); // Pass props to the action
                    }
                }
            }
        });
    }
}
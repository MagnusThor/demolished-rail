import { Canvas2DEntity } from './Entity/Canvas2DEntity';
import {
  CompositeEntity,
  ICompositeEntityProps,
} from './Entity/CompositeEntity';
import { Sequence } from './Sequence';

export interface ITimelineEvent<T, P> {
    time?: number;        // Time in milliseconds
    beatCount?: number;   // Beat count
    barCount?: number;    // Bar count
    action: (entity: Canvas2DEntity<T> | CompositeEntity<ICompositeEntityProps<T>>, eventProps: P, criteriaResult?: boolean) => void;
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
    triggerEvents(sequence: Sequence) {
        this.events.forEach(event => {
            const { time, beatCount, barCount, action, targetEntity, criteria, props } = event;

            // Check if the event should be triggered
            const timeCondition = time !== undefined ? this.currentTime >= time : true; // True if time is not specified
            const beatCondition = beatCount !== undefined ? sequence.beatCounter >= beatCount : true; // True if beatCount is not specified
            const barCondition = barCount !== undefined ? sequence.currentBar >= barCount : true; // True if barCount is not specified
            const criteriaResult = criteria ? criteria() : true;

            // Combine all conditions
            if (
                (timeCondition && beatCondition && barCondition) && // All specified conditions must be true
                criteriaResult // Criteria must also be true (if provided)
            ) {
                const entity = sequence.currentScene?.entities.find(e => e.name === targetEntity);
                if (entity) {
                    action(entity as any, props, criteriaResult);
                }
            }
        });
    }


}
        import { ICollisionResult } from "../../interface/ICollisionResult";
        import { IGameEntity } from "../../interface/IGameEntity";
        import { ICollisionEventDescriptor } from "./ICollisionEventDescriptor";


        export class CollisionEvent {
                // Corrected the name for clarity and consistency
                subscriptions: Map<string, ICollisionEventDescriptor> = new Map();

                constructor() { }

                /**
                 * Subscribes an action to a topic that will be invoked an infinite number of times.
                 */
                subscribe(topic: string, action: (self: IGameEntity<any>, data?: any) => void): void {
                        this.subscriptions.set(topic, {
                                action: action,
                                numberOfInvokes: 0,
                                maxNumberOfInvokes: Infinity,
                                type: "infinity"
                        });
                }

                /**
                 * Subscribes an action that will be invoked only once.
                 */
                once(topic: string, action: (self: IGameEntity<any>, data?:any) => void): void {
                        this.subscriptions.set(topic, {
                                action: action,
                                numberOfInvokes: 0,
                                maxNumberOfInvokes: 1,
                                type: "once"
                        });
                }

                /**
                 * Subscribes an action that will be invoked a specific number of times.
                 */
                many(topic: string, listenFor: number, action: (self: IGameEntity<any>, data?:any) => void): void {
                        this.subscriptions.set(topic, {
                                action: action,
                                numberOfInvokes: 0,
                                maxNumberOfInvokes: listenFor,
                                type: "many"
                        });
                }

                /**
                 * Unsubscribes an action from a topic.
                 */
                unsubscribe(topic: string): void {
                        this.subscriptions.delete(topic);
                }

                /**
                 * Publishes an event to a topic, invoking the subscribed action and managing its lifecycle.
                 */
                publish(topic: string, entity: IGameEntity<any>, data?:any): void {
                        const subscription = this.subscriptions.get(topic);
                        if (subscription) {
                                subscription.action(entity, data);
                                subscription.numberOfInvokes++;

                                if (subscription.type === "once" || (subscription.type === "many" && subscription.numberOfInvokes >= subscription.maxNumberOfInvokes!)) {
                                        this.unsubscribe(topic);
                                }
                        } else {
                                console.warn(`No subscriptions found for topic: ${topic} on entity: ${entity.name}`);
                        }
                }
        }

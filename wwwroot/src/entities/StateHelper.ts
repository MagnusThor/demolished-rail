import { IGameEntityBase } from "../interface/IGameEntity";



export class StateHelper<T extends IGameEntityBase> {
    private props: T;

    /**
     * @param props The entity's properties object.
     */
    constructor(props: T) {
        this.props = props;
    }
    /**
     * Retrieves a state value from the entity's props with a type guard.
     * @param key The key of the state property to retrieve.
     * @returns The value of the state property, or null if it doesn't exist or doesn't match the expected type.
     */
    public get<T>(key: string): T  {
        if (!this.props.states || typeof this.props.states[key] === 'undefined') {
            return false as T;
        }
        return this.props.states[key] as T;
    }
    /**
     * Sets a state value on the entity's props.
     * @param key The key of the state property to set.
     * @param value The value to assign to the state property.
     */
    public set<T>(key: string, value: T): void {
        if (!this.props.states) {
            console.warn("Attempted to set state on an entity without a state object.");
            return;
        }
        this.props.states[key] = value as any;
    }
}

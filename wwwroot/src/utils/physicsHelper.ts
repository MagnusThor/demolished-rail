import { CollisionAxis } from "../enums/CollisionAxis";
import { ICollisionResult } from "../interface/ICollisionResult";

/**
 * A generic interface for any entity that needs to interact with the physics helper.
 */
export interface IPhysicsProps {
    posX: number;
    posY: number;
    size?: number; // A generic size property for objects with thermal expansion
    velX: number;
    velY: number;
    bounciness?: number; // The bounce factor (0 to 1)
    gravity?: number; // The force of gravity affecting the entity
    friction?: number; // A factor that slows the entity down when sliding along a surface
    drag?: number; // A factor that simulates air resistance, slowing the entity down over time
    mass?: number; // The mass of the entity, used to calculate force and inertia
    terminalVelocityY?: number; // The maximum falling speed
    temperature?: number; // The current temperature of the object
    thermalExpansionCoefficient?: number; // A factor determining how much the object expands with heat
    thermalConductivity?: number; // A factor determining how quickly the object's temperature changes
}

/**
 * Helper class for common physics calculations.
 */
export class PhysicsHelper {
    /**
     * Applies a force to an entity based on its mass, returning the new velocity.
     * This method is a direct application of **Newton's Second Law** ($F = ma$).
     * The formula used is $a = F/m$ where $a$ is acceleration, $F$ is force, and $m$ is mass.
     * @param props The physics properties of the entity.
     * @param forceX The force to apply on the X-axis.
     * @param forceY The force to apply on the Y-axis.
     * @returns The updated properties with the force applied to velocity.
     */
    public applyForceByMass<T extends IPhysicsProps>(props: T, forceX: number, forceY: number): T {
        const newProps = { ...props };
        const mass = newProps.mass ?? 1;

        newProps.velX += forceX / mass;
        newProps.velY += forceY / mass;

        return newProps;
    }

    /**
     * Updates an entity's position based on its current velocity.
     * This is a core part of any physics update loop and is the foundation of **kinematics**.
     * @param props The physics properties of the entity, including position and velocity.
     * @returns The updated properties with the new position.
     */
    public kinematicUpdate<T extends IPhysicsProps>(props: T): T {
        const newProps = { ...props };
        newProps.posX += newProps.velX;
        newProps.posY += newProps.velY;
        return newProps;
    }

    /**
     * Applies gravity to the entity's vertical velocity.
     * This represents a constant downward force, which is a specific case of **Newton's Second Law**.
     * @param props The physics properties of the entity.
     * @returns The updated properties with gravity applied.
     */
    public applyGravity<T extends IPhysicsProps>(props: T): T {
        const newProps = { ...props };
        const gravity = newProps.gravity ?? 0;
        newProps.velY += gravity;
        return newProps;
    }

    /**
     * Calculates the new velocity of a physics-enabled entity after it collides with a surface.
     * This models a simple **elastic collision** with a bounciness factor to simulate energy loss.
     * @param props The properties of the entity, including velocity and bounciness.
     * @param result The collision result, indicating the axis of impact.
     * @returns The updated properties with new velocity values.
     */
    public calculateBounce<T extends IPhysicsProps>(props: T, result: ICollisionResult): T {
        const newProps = { ...props };
        const bounciness = newProps.bounciness ?? 0.5;

        if (result.axis === CollisionAxis.Y) {
            newProps.velY *= -bounciness;
        } else if (result.axis === CollisionAxis.X) {
            newProps.velX *= -bounciness;
        }

        return newProps;
    }

    /**
     * Applies friction to an entity's velocity.
     * This represents a **force opposing motion**, typically used when an entity is in contact with a surface.
     * @param props The physics properties of the entity.
     * @returns The updated properties with friction applied.
     */
    public applyFriction<T extends IPhysicsProps>(props: T): T {
        const newProps = { ...props };
        const friction = newProps.friction ?? 0;

        if (newProps.velX !== 0) {
            newProps.velX *= (1 - friction);
            if (Math.abs(newProps.velX) < 0.01) {
                newProps.velX = 0;
            }
        }
        return newProps;
    }

    /**
     * Applies a simple drag (air resistance) to an entity's velocity.
     * This also represents a **force opposing motion**, typically used when the entity is in the air.
     * @param props The physics properties of the entity.
     * @returns The updated properties with drag applied.
     */
    public applyDrag<T extends IPhysicsProps>(props: T): T {
        const newProps = { ...props };
        const drag = newProps.drag ?? 0;
        newProps.velX *= (1 - drag);
        newProps.velY *= (1 - drag);
        return newProps;
    }

    /**
     * Clamps the entity's vertical velocity at a maximum value to simulate terminal velocity.
     * This is a practical application of **fluid dynamics** within a simple physics model.
     * @param props The physics properties of the entity.
     * @returns The updated properties with velocity clamped.
     */
    public clampTerminalVelocity<T extends IPhysicsProps>(props: T): T {
        const newProps = { ...props };
        const terminalVelocity = newProps.terminalVelocityY ?? Infinity;
        if (newProps.velY > terminalVelocity) {
            newProps.velY = terminalVelocity;
        }
        return newProps;
    }

    /**
     * Calculates the change in an object's temperature based on a target environmental temperature.
     * This simulates **heat transfer**.
     * @param props The physics properties of the entity.
     * @param targetTemperature The temperature of the environment.
     * @returns The updated properties with the new temperature.
     */
    public applyHeatTransfer<T extends IPhysicsProps>(props: T, targetTemperature: number): T {
        const newProps = { ...props };
        const thermalConductivity = newProps.thermalConductivity ?? 0.05;
        const tempDifference = targetTemperature - (newProps.temperature ?? 0);

        newProps.temperature = (newProps.temperature ?? 0) + tempDifference * thermalConductivity;
        return newProps;
    }
    
    /**
     * Calculates the thermal expansion of an object, updating its size.
     * The formula is $\Delta L = \alpha L_0 \Delta T$ where $\alpha$ is the thermal expansion coefficient.
     * @param props The physics properties of the entity.
     * @param baseSize The original size of the object at a base temperature.
     * @param baseTemperature The temperature at which the object has its base size.
     * @returns The updated properties with the new size.
     */
    public applyThermalExpansion<T extends IPhysicsProps>(props: T, baseSize: number, baseTemperature: number): T {
        const newProps = { ...props };
        const expansionCoefficient = newProps.thermalExpansionCoefficient ?? 0.01;
        const tempDifference = (newProps.temperature ?? baseTemperature) - baseTemperature;
        
        // Calculate the new size based on thermal expansion
        const newSize = baseSize * (1 + expansionCoefficient * tempDifference);
        newProps.size = newSize;

        return newProps;
    }

    /**
     * Applies a random offset for a visual shaking effect.
     * This is separate from physics calculations, as shaking is a visual effect.
     * @param intensity The maximum pixel offset for the shake.
     * @returns An object containing random X and Y offsets.
     */
    public static calculateShakeOffset(intensity: number): { x: number, y: number } {
        return {
            x: Math.random() * intensity - (intensity / 2),
            y: Math.random() * intensity - (intensity / 2),
        };
    }
}

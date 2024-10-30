export class SequenceHelper {
    /**
     * Calculates the duration in milliseconds for a given number of beats.
     * @param bpm - The beats per minute.
     * @param numBeats - The number of beats.
     * @returns The duration in milliseconds.
     */
    static getDurationForBeats(bpm: number, numBeats: number): number {
        const millisecondsPerBeat = 60000 / bpm;
        return numBeats * millisecondsPerBeat;
    }

    /**
     * Calculates the duration in milliseconds for a given number of bars.
     * @param bpm - The beats per minute.
     * @param beatsPerBar - The number of beats per bar.
     * @param numBars - The number of bars.
     * @returns The duration in milliseconds.
     */
    static getDurationForBars(bpm: number, beatsPerBar: number, numBars: number): number {
        const millisecondsPerBar = (60000 / bpm) * beatsPerBar;
        return numBars * millisecondsPerBar;
    }

    /**
     * Calculates the duration in milliseconds for a given number of ticks.
     * @param bpm - The beats per minute.
     * @param ticksPerBeat - The number of ticks per beat.
     * @param numTicks - The number of ticks.
     * @returns The duration in milliseconds.
     */
    static getDurationForTicks(bpm: number, ticksPerBeat: number, numTicks: number): number {
        const millisecondsPerTick = 60000 / (bpm * ticksPerBeat);
        return numTicks * millisecondsPerTick;
    }
}
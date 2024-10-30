import * as sonant from 'sonantx'

export interface IAudioLoader {
    loadAudio(audioContext: AudioContext): Promise<AudioBuffer>;
  }
  
  // RegularAudioLoader.ts
  export class DefaultAudioLoader implements IAudioLoader {
    constructor(private audioFile: string) {}
  
    async loadAudio(audioContext: AudioContext): Promise<AudioBuffer> {
      const response = await fetch(this.audioFile);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;   
  
    }
  }



export class SonantAudioLoader implements IAudioLoader {
  constructor(private songData: {}) {} // Replace 'any' with the actual type of your song data

  async loadAudio(audioContext: AudioContext): Promise<AudioBuffer> {
    console.log(`Generating audioBuffer - it may take a while`);
    const audioBuffer = await sonant.generateSong(this.songData, audioContext.sampleRate);
  
    return audioBuffer;
  }
}
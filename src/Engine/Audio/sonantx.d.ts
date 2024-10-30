declare module 'sonantx' {
    function generateSong(songData: any, sampleRate: number): Promise<AudioBuffer>;
    
  }
// Hook to play notification sound when product is added to cart
export const useNotificationSound = () => {
  const playSound = () => {
    try {
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioContext.currentTime;

      // Create oscillators for a pleasant notification sound (musical "ding")
      // Two notes to make it sound more pleasant
      const notes = [
        { freq: 523.25, duration: 0.2 }, // C5
        { freq: 659.25, duration: 0.15 }, // E5
      ];

      notes.forEach((note, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        // Connect nodes
        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Set oscillator properties
        osc.frequency.value = note.freq;
        osc.type = 'sine';

        // Set gain envelope for smooth fade out
        const startTime = now + (index * 0.1);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);

        // Play note
        osc.start(startTime);
        osc.stop(startTime + note.duration);
      });
    } catch (error) {
      // Silently fail if audio context is not available
      console.log('Notification sound not available');
    }
  };

  return { playSound };
};

/**
 * Sound & Haptic Feedback Hook - Futuristic & Gentle
 * Uses Web Audio API for sounds and Vibration API for haptics
 */

import { useCallback, useRef } from 'react';

type SoundType = 'click' | 'whoosh' | 'success' | 'error' | 'scan' | 'hover';

// Check if vibration is supported
const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

export function useSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Haptic feedback patterns (in milliseconds)
  const hapticLight = useCallback(() => {
    if (canVibrate) navigator.vibrate(10);
  }, []);

  const hapticMedium = useCallback(() => {
    if (canVibrate) navigator.vibrate(25);
  }, []);

  const hapticHeavy = useCallback(() => {
    if (canVibrate) navigator.vibrate(50);
  }, []);

  const hapticSuccess = useCallback(() => {
    if (canVibrate) navigator.vibrate([15, 50, 15]); // Double tap pattern
  }, []);

  const hapticError = useCallback(() => {
    if (canVibrate) navigator.vibrate([30, 30, 30, 30, 50]); // Rumble pattern
  }, []);

  const hapticScan = useCallback(() => {
    if (canVibrate) navigator.vibrate([10, 30, 10, 30, 10]); // Triple pulse
  }, []);

  const playClick = useCallback(() => {
    hapticLight();
    
    const ctx = getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  }, [getContext, hapticLight]);

  const playWhoosh = useCallback(() => {
    hapticMedium();
    
    const ctx = getContext();
    
    // Create noise for whoosh effect
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.2);
    filter.Q.value = 1;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start(ctx.currentTime);
  }, [getContext, hapticMedium]);

  const playSuccess = useCallback(() => {
    hapticSuccess();
    
    const ctx = getContext();
    
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
    
    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + i * 0.05;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }, [getContext, hapticSuccess]);

  const playError = useCallback(() => {
    hapticError();
    
    const ctx = getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }, [getContext, hapticError]);

  const playScan = useCallback(() => {
    hapticScan();
    
    const ctx = getContext();
    
    // Scanning beep sequence
    for (let i = 0; i < 3; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      const startTime = ctx.currentTime + i * 0.08;
      oscillator.frequency.setValueAtTime(1200 + i * 200, startTime);

      gainNode.gain.setValueAtTime(0.05, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.06);
    }
  }, [getContext, hapticScan]);

  const playHover = useCallback(() => {
    // No haptic for hover - too subtle
    const ctx = getContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.04);
  }, [getContext]);

  const play = useCallback((type: SoundType) => {
    switch (type) {
      case 'click':
        playClick();
        break;
      case 'whoosh':
        playWhoosh();
        break;
      case 'success':
        playSuccess();
        break;
      case 'error':
        playError();
        break;
      case 'scan':
        playScan();
        break;
      case 'hover':
        playHover();
        break;
    }
  }, [playClick, playWhoosh, playSuccess, playError, playScan, playHover]);

  return { 
    play, 
    playClick, 
    playWhoosh, 
    playSuccess, 
    playError, 
    playScan, 
    playHover,
    // Expose haptics for standalone use
    hapticLight,
    hapticMedium,
    hapticHeavy,
  };
}

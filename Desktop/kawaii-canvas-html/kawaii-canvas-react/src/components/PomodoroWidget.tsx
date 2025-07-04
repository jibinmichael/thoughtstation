import React, { useState, useEffect, useRef, useCallback } from 'react';

// Soundscape frequencies for Web Audio API
const soundscapeFrequencies = [200, 300, 250, 150, 400]; // Rain, Forest, Ocean, Fire, Birds

interface PomodoroWidgetProps {
  onClose: () => void;
  onTimerStateChange: (running: boolean) => void;
}

const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({ onClose, onTimerStateChange }) => {
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tickPlayed, setTickPlayed] = useState(false);
  const [selectedSoundscape, setSelectedSoundscape] = useState(0);
  
  // Refs
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitleRef = useRef<string>(document.title);
  
  // Audio elements
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const completeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Notify parent when timer running state changes
  useEffect(() => {
    onTimerStateChange(isRunning && !isPaused);
  }, [isRunning, isPaused, onTimerStateChange]);

  // Initialize audio
  useEffect(() => {
    // Initialize Web Audio API
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextConstructor = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextConstructor();
    } catch {
      console.log('Web Audio API not supported');
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      // Stop audio when component unmounts
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 0) {
            // Timer completed
            setIsRunning(false);
            setIsPaused(false);
            setTickPlayed(false);
            document.title = originalTitleRef.current;
            if (completeAudioRef.current) {
              completeAudioRef.current.play().catch(() => {});
            }
            return 300; // Reset to 5 minutes
          }
          
          const newSeconds = prev - 1;
          
          // Play tick sound when 10 seconds remaining (only once)
          if (newSeconds === 10 && !tickPlayed) {
            setTickPlayed(true);
            if (tickAudioRef.current) {
              tickAudioRef.current.play().catch(() => {});
            }
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, isPaused, tickPlayed]);

  // Update browser title
  useEffect(() => {
    if (isRunning && !isPaused) {
      const min = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
      const sec = (timerSeconds % 60).toString().padStart(2, '0');
      document.title = `${min}:${sec} - Focus Timer`;
    } else {
      document.title = originalTitleRef.current;
    }
  }, [timerSeconds, isRunning, isPaused]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Timer controls
  const handleStart = () => {
    if (timerSeconds === 0) return;
    setIsRunning(true);
    setIsPaused(false);
    setTickPlayed(false);
  };

  const handlePause = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTickPlayed(false);
    setTimerSeconds(0);
    document.title = originalTitleRef.current;
  };

  const handleAdd5Min = () => {
    setTimerSeconds(prev => prev + 300);
  };

  // Soundscapes
  const soundscapes = [
    { name: 'Rain', emoji: '🌧️' },
    { name: 'Forest', emoji: '🌲' },
    { name: 'Ocean', emoji: '🌊' },
    { name: 'Fire', emoji: '🔥' },
    { name: 'Birds', emoji: '🐦' }
  ];

  // Music control function
  const handleMusicPlayback = useCallback((shouldPlay: boolean) => {
    if (!audioContextRef.current) return;
    
    if (shouldPlay) {
      // Stop any existing oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      
      // Create new oscillator and gain node
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();
      
      // Connect nodes
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      // Set frequency based on selected soundscape
      oscillatorRef.current.frequency.setValueAtTime(
        soundscapeFrequencies[selectedSoundscape], 
        audioContextRef.current.currentTime
      );
      oscillatorRef.current.type = 'sine';
      
      // Set volume
      gainNodeRef.current.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      
      // Start playing
      oscillatorRef.current.start();
      
      console.log(`Playing soundscape ${selectedSoundscape} at ${soundscapeFrequencies[selectedSoundscape]}Hz`);
    } else {
      // Stop playing
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      console.log('Music stopped');
    }
  }, [selectedSoundscape]);

  // Update music when soundscape changes
  useEffect(() => {
    if (isRunning && !isPaused) {
      // Restart with new frequency
      handleMusicPlayback(false);
      setTimeout(() => handleMusicPlayback(true), 50);
    }
  }, [selectedSoundscape, isRunning, isPaused, handleMusicPlayback]);

  // Control music based on timer state
  useEffect(() => {
    handleMusicPlayback(isRunning && !isPaused);
  }, [isRunning, isPaused, handleMusicPlayback]);

  return (
    <div className="pomodoro-widget">
      {/* Header */}
      <div className="pomodoro-header">
        <div className="pomodoro-title">Focus Timer</div>
        <button className="pomodoro-close-btn" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="5" y1="5" x2="15" y2="15" stroke="#666" strokeWidth="1" strokeLinecap="round"/>
            <line x1="15" y1="5" x2="5" y2="15" stroke="#666" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="pomodoro-body">
        {/* Timer Container */}
        <div className="pomodoro-timer-container">
          {/* Timer Display */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className="pomodoro-timer-background">88:88</div>
            <div className="pomodoro-timer-display">{formatTime(timerSeconds)}</div>
          </div>
          
          {/* +5 Min Button */}
          <div className="pomodoro-timer-controls-row">
            <button className="pomodoro-add-5min-btn" onClick={handleAdd5Min}>
              +5 min
            </button>
          </div>
        </div>

        {/* Vinyl Player */}
        <div className="pomodoro-vinyl-row">
          <div className={`vinyl-player ${isRunning && !isPaused ? 'playing' : ''}`}>
            <div className="album"></div>
            <div className="vinyl-tonearm"></div>
          </div>
        </div>

        {/* Music Controls */}
        <div className="pomodoro-music-controls">
          <div className="soundscape-circles">
            {soundscapes.map((soundscape, index) => (
              <div
                key={index}
                className={`soundscape-circle ${selectedSoundscape === index ? 'selected' : ''}`}
                onClick={() => setSelectedSoundscape(index)}
              >
                {soundscape.emoji}
                <span className="tooltip">{soundscape.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Timer Controls */}
        <div className="focus-timer-controls">
          {!isRunning ? (
            <button className="focus-start-btn" onClick={handleStart}>
              Start Focus Timer
            </button>
          ) : (
            <>
              <button className="focus-pause-btn" onClick={handlePause}>
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button className="focus-stop-btn" onClick={handleStop}>
                Stop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroWidget; 
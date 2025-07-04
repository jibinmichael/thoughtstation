import React, { useState, useEffect, useRef } from 'react';

// Soundscape audio URLs (using royalty-free nature sounds)
const soundscapeAudio = [
  'https://www.soundjay.com/misc/sounds/rain-01.wav', // Rain
  'https://www.soundjay.com/misc/sounds/forest-01.wav', // Forest
  'https://www.soundjay.com/misc/sounds/ocean-01.wav', // Ocean
  'https://www.soundjay.com/misc/sounds/fire-01.wav', // Fire
  'https://www.soundjay.com/misc/sounds/birds-01.wav', // Birds
];

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
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Notify parent when timer running state changes
  useEffect(() => {
    onTimerStateChange(isRunning && !isPaused);
  }, [isRunning, isPaused, onTimerStateChange]);

  // Initialize audio
  useEffect(() => {
    tickAudioRef.current = new Audio('https://www.soundjay.com/misc/sounds/clock-ticking-4.wav');
    completeAudioRef.current = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
    
    // Initialize music audio with first soundscape
    musicAudioRef.current = new Audio(soundscapeAudio[0]);
    
    if (tickAudioRef.current) tickAudioRef.current.volume = 0.3;
    if (completeAudioRef.current) completeAudioRef.current.volume = 0.5;
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = 0.4;
      musicAudioRef.current.loop = true; // Loop the music
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      // Stop music when component unmounts
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current.currentTime = 0;
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
  const handleMusicPlayback = (shouldPlay: boolean) => {
    if (!musicAudioRef.current) return;
    
    if (shouldPlay) {
      musicAudioRef.current.play().catch(() => {
        // Handle autoplay restrictions gracefully
        console.log('Music autoplay blocked by browser');
      });
    } else {
      musicAudioRef.current.pause();
    }
  };

  // Update music when soundscape changes
  useEffect(() => {
    if (musicAudioRef.current) {
      const wasPlaying = !musicAudioRef.current.paused;
      musicAudioRef.current.pause();
      musicAudioRef.current.src = soundscapeAudio[selectedSoundscape];
      musicAudioRef.current.load();
      
      // Resume playing if it was playing before
      if (wasPlaying && isRunning && !isPaused) {
        musicAudioRef.current.play().catch(() => {});
      }
    }
  }, [selectedSoundscape, isRunning, isPaused]);

  // Control music based on timer state
  useEffect(() => {
    handleMusicPlayback(isRunning && !isPaused);
  }, [isRunning, isPaused]);

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
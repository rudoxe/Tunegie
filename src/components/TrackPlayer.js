import React, { useState, useEffect, useRef } from 'react';

export default function TrackPlayer({ track, onSnippetEnd }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [snippetStart, setSnippetStart] = useState(0);
  const [audioContextReady, setAudioContextReady] = useState(false);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const snippetDuration = 5; // 5 seconds

  // Reset when track changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasPlayed(false);
    
    // Generate random snippet start time (simulate different parts of song)
    const songLength = track?.duration || 180; // Default 3 minutes
    const maxStart = Math.max(0, songLength - snippetDuration - 10); // Leave 10s buffer at end
    const randomStart = Math.floor(Math.random() * maxStart);
    setSnippetStart(randomStart);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [track?.id]);

  // Create audio URL (with fallback for development)
  const getAudioUrl = () => {
    // Check if track has a preview URL from TIDAL
    if (track?.previewUrl) {
      return track.previewUrl;
    }
    
    // For development: Use sample audio files if available
    // You can add sample .mp3 files to public/audio/ folder
    const sampleAudios = {
      'mock-1': '/audio/sample1.mp3',
      'mock-ed-1': '/audio/ed-sheeran-sample.mp3',
      'mock-ts-1': '/audio/taylor-swift-sample.mp3',
      // Add more mappings as needed
    };
    
    const sampleUrl = sampleAudios[track?.id];
    if (sampleUrl) {
      // Check if file exists before returning
      return sampleUrl;
    }
    
    return null; // No audio available
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('✅ Audio context created and ready');
        setAudioContextReady(true);
      } catch (error) {
        console.error('❌ Failed to create audio context:', error);
      }
    }
    
    // Resume if suspended (required by some browsers)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        console.log('✅ Audio context resumed');
        setAudioContextReady(true);
      });
    }
  };

  const playSnippet = () => {
    // Initialize audio context on first user interaction
    initAudioContext();
    
    if (hasPlayed) {
      // Allow replay
      setCurrentTime(0);
    }

    setIsPlaying(true);
    setHasPlayed(true);

    const audioUrl = getAudioUrl();
    
    if (audioUrl && audioRef.current) {
      // Play real audio
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.7; // Set volume to 70%
      audioRef.current.play().catch(err => {
        console.warn('Audio playback failed:', err);
        // Fallback to generated audio if real audio fails
        simulatePlayback();
      });
      
      // Stop after 5 seconds
      setTimeout(() => {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          stopSnippet();
          if (onSnippetEnd) onSnippetEnd();
        }
      }, snippetDuration * 1000);
    } else {
      // Generate audio for development
      simulatePlayback();
    }
  };

  const simulatePlayback = () => {
    // Create actual audio using Web Audio API
    createAudioSnippet();
    
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= snippetDuration) {
          stopSnippet();
          if (onSnippetEnd) onSnippetEnd();
          return snippetDuration;
        }
        return newTime;
      });
    }, 100);
  };

  // Create a simple audio snippet with Web Audio API
  const createAudioSnippet = () => {
    try {
      if (!audioContextRef.current) {
        console.warn('❌ Audio context not initialized');
        return;
      }
      
      const audioContext = audioContextRef.current;
      
      // Comprehensive audio diagnostics
      console.log('🔍 Audio Diagnostics:', {
        'Audio Context State': audioContext.state,
        'Sample Rate': audioContext.sampleRate,
        'Current Time': audioContext.currentTime,
        'Destination': audioContext.destination,
        'Output Channels': audioContext.destination.channelCount
      });
      
      // Generate different sounds based on artist name
      const artistName = track?.artists?.[0]?.name?.toLowerCase() || '';
      const trackTitle = track?.title?.toLowerCase() || '';
      
      // Determine style based on artist
      let style = 'pop'; // default
      if (artistName.includes('travis') || artistName.includes('carti') || artistName.includes('uzi') || artistName.includes('baby')) {
        style = 'trap';
      } else if (artistName.includes('billie') || artistName.includes('weeknd') || artistName.includes('frank')) {
        style = 'alternative';
      } else if (artistName.includes('kendrick') || artistName.includes('cole') || artistName.includes('future')) {
        style = 'hiphop';
      }
      
      const playBeat = (style) => {
        const now = audioContext.currentTime;
        
        if (style === 'trap') {
          // Trap-style beat with 808s
          createTrapBeat(audioContext, now);
        } else if (style === 'hiphop') {
          // Hip-hop beat
          createHipHopBeat(audioContext, now);
        } else if (style === 'alternative') {
          // Alternative/indie sound
          createAlternativeMelody(audioContext, now);
        } else {
          // Pop melody
          createPopMelody(audioContext, now);
        }
      };
      
      // Resume audio context if suspended (critical for Chrome/Safari)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('✅ Audio context resumed before playback');
          playBeat(style);
        });
      } else {
        playBeat(style);
      }
      
      console.log(`🎵 Playing ${style} style audio for "${track?.title}" by ${track?.artists?.[0]?.name} (${Math.floor(snippetStart/60)}:${(snippetStart%60).toString().padStart(2,'0')} - ${Math.floor((snippetStart+snippetDuration)/60)}:${((snippetStart+snippetDuration)%60).toString().padStart(2,'0')})`);
      
      // Vary the audio based on where in the song we are
      const songPosition = snippetStart / (track?.duration || 180);
      const currentTime = audioContext.currentTime;
      if (songPosition < 0.2) {
        // Intro - softer, building up
        modifyForIntro(audioContext, currentTime);
      } else if (songPosition > 0.7) {
        // Outro - fading, more atmospheric
        modifyForOutro(audioContext, currentTime);
      }
      
    } catch (error) {
      console.warn('Web Audio API not supported or failed:', error);
    }
  };
  
  const createTrapBeat = (audioContext, startTime) => {
    console.log('🎵 Creating trap beat...');
    
    // 808 kick pattern - multiple frequencies for more aggressive sound
    const kickFreqs = [60, 80, 100, 70, 90];
    
    kickFreqs.forEach((freq, i) => {
      // Primary kick
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      osc1.frequency.setValueAtTime(freq, startTime + i * 1);
      osc1.type = 'sine';
      
      gain1.gain.setValueAtTime(0.9, startTime + i * 1); // Very high volume
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + i * 1 + 0.4);
      
      osc1.start(startTime + i * 1);
      osc1.stop(startTime + i * 1 + 0.4);
      
      // Add high-frequency click for punch
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.frequency.setValueAtTime(2000, startTime + i * 1);
      osc2.type = 'square';
      
      gain2.gain.setValueAtTime(0.3, startTime + i * 1);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + i * 1 + 0.05);
      
      osc2.start(startTime + i * 1);
      osc2.stop(startTime + i * 1 + 0.05);
    });
    
    console.log('✅ Trap beat oscillators created and started');
  };
  
  const createHipHopBeat = (audioContext, startTime) => {
    const frequencies = [110, 130, 150, 120, 140];
    frequencies.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, startTime + i * 1);
      osc.type = 'sawtooth';
      
      gain.gain.setValueAtTime(0.6, startTime + i * 1); // Increased volume
      gain.gain.linearRampToValueAtTime(0, startTime + i * 1 + 0.5);
      
      osc.start(startTime + i * 1);
      osc.stop(startTime + i * 1 + 0.5);
    });
  };
  
  const createAlternativeMelody = (audioContext, startTime) => {
    const frequencies = [440, 523, 659, 587, 493]; // A, C, E, D, B
    frequencies.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, startTime + i * 1);
      osc.type = 'triangle';
      
      gain.gain.setValueAtTime(0.4, startTime + i * 1); // Increased volume
      gain.gain.linearRampToValueAtTime(0, startTime + i * 1 + 1.2);
      
      osc.start(startTime + i * 1);
      osc.stop(startTime + i * 1 + 1.2);
    });
  };
  
  const createPopMelody = (audioContext, startTime) => {
    const frequencies = [262, 294, 330, 349, 392]; // C, D, E, F, G
    frequencies.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, startTime + i * 1);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.6, startTime + i * 1); // Increased volume
      gain.gain.linearRampToValueAtTime(0, startTime + i * 1 + 0.8);
      
      osc.start(startTime + i * 1);
      osc.stop(startTime + i * 1 + 0.8);
    });
  };
  
  const modifyForIntro = (audioContext, startTime) => {
    // Add soft ambient pad for intro sections
    const pad = audioContext.createOscillator();
    const padGain = audioContext.createGain();
    
    pad.connect(padGain);
    padGain.connect(audioContext.destination);
    
    pad.frequency.setValueAtTime(110, startTime);
    pad.type = 'triangle';
    
    padGain.gain.setValueAtTime(0, startTime);
    padGain.gain.linearRampToValueAtTime(0.05, startTime + 1);
    padGain.gain.linearRampToValueAtTime(0.03, startTime + 4);
    padGain.gain.linearRampToValueAtTime(0, startTime + 5);
    
    pad.start(startTime);
    pad.stop(startTime + 5);
  };
  
  const modifyForOutro = (audioContext, startTime) => {
    // Add reverb-like effect for outro sections
    const echo = audioContext.createOscillator();
    const echoGain = audioContext.createGain();
    
    echo.connect(echoGain);
    echoGain.connect(audioContext.destination);
    
    echo.frequency.setValueAtTime(880, startTime + 0.3);
    echo.type = 'sine';
    
    echoGain.gain.setValueAtTime(0.02, startTime + 0.3);
    echoGain.gain.linearRampToValueAtTime(0, startTime + 3);
    
    echo.start(startTime + 0.3);
    echo.stop(startTime + 3);
  };
  
  // Test function to play a simple beep - for debugging audio issues
  const playTestTone = async () => {
    try {
      // Initialize audio context
      initAudioContext();
      
      if (!audioContextRef.current) {
        console.error('❌ Cannot create test tone - no audio context');
        return;
      }
      
      const audioContext = audioContextRef.current;
      
      // Resume if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      console.log('🗏 Playing test tone at 440Hz for 1 second...');
      
      // Create a simple 440Hz tone
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      
      oscillator.onended = () => {
        console.log('✅ Test tone completed');
      };
      
    } catch (error) {
      console.error('❌ Test tone failed:', error);
    }
  };

  const stopSnippet = () => {
    setIsPlaying(false);
    
    // Stop real audio if playing
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    
    // Clear simulation interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopSnippet();
    } else {
      playSnippet();
    }
  };
  
  const generateNewSnippet = () => {
    if (isPlaying) {
      stopSnippet();
    }
    
    // Generate new random snippet start time
    const songLength = track?.duration || 180;
    const maxStart = Math.max(0, songLength - snippetDuration - 10);
    const newRandomStart = Math.floor(Math.random() * maxStart);
    setSnippetStart(newRandomStart);
    setCurrentTime(0);
    
    // Automatically play the new snippet
    setTimeout(() => playSnippet(), 100);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds) => {
    return `${Math.floor(seconds)}s`;
  };

  return (
    <div className="bg-black/50 rounded-lg p-6">
      <div className="text-center">
        <div className="mb-4">
          <p className="text-green-200/60 text-sm">Audio Snippet</p>
          <p className="text-green-400 font-semibold text-lg">{track?.album?.title || 'Unknown Album'}</p>
          <p className="text-green-200/80 text-xs mt-1">
            Playing from {Math.floor(snippetStart / 60)}:{(snippetStart % 60).toString().padStart(2, '0')} - {Math.floor((snippetStart + snippetDuration) / 60)}:{((snippetStart + snippetDuration) % 60).toString().padStart(2, '0')}
          </p>
        </div>
        
        {/* Play Buttons */}
        <div className="flex gap-4 justify-center mb-4">
          <button
            onClick={togglePlayback}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-black'
            }`}
            title={isPlaying ? 'Stop' : hasPlayed ? 'Play Again' : 'Play 5s Snippet'}
          >
            {isPlaying ? '⏹️' : '▶️'}
          </button>
          
          {hasPlayed && (
            <button
              onClick={generateNewSnippet}
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition bg-blue-600 hover:bg-blue-500 text-white"
              title="Play Different Part of Song"
            >
              🔀
            </button>
          )}
          
          {/* Test Audio Button - for debugging */}
          <button
            onClick={playTestTone}
            className="w-16 h-16 rounded-full flex items-center justify-center text-xs font-bold transition bg-yellow-600 hover:bg-yellow-500 text-black"
            title="Test Audio (Simple Beep)"
          >
            🔊
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / snippetDuration) * 100}%` }}
            ></div>
          </div>
          <p className="text-green-300 text-sm">
            {formatTime(currentTime)} / {formatTime(snippetDuration)}
          </p>
        </div>

        {/* Audio Info */}
        <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 mt-4">
          <p className="text-green-300 text-xs">
            🎵 <strong>Generated Audio:</strong> Playing style-based audio snippets! 
            Each artist gets a unique sound pattern. 
            {hasPlayed && <span className="block mt-1">Try different artists to hear various music styles!</span>}
          </p>
        </div>

        {hasPlayed && (
          <p className="text-green-400 text-sm mt-3">
            ✨ Snippet played! Now make your guess based on what you "heard"
          </p>
        )}
      </div>

      {/* Hidden audio element for future real implementation */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onEnded={stopSnippet}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
      />
    </div>
  );
}

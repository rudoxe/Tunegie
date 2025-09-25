import React, { useState, useRef, useEffect } from 'react';
import itunesApiService from '../services/itunesApi';

const TrackPlayer = ({ track, onSnippetEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [previewInfo, setPreviewInfo] = useState(null);
  const [snippetStart, setSnippetStart] = useState(() => {
    // Start at random position within 30-second preview
    const previewDuration = 30;
    const snippetDuration = 5;
    const maxStart = previewDuration - snippetDuration; // 0-25 seconds
    return Math.floor(Math.random() * maxStart);
  });
  
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const snippetTimeoutRef = useRef(null);
  const snippetDuration = 5; // 5 seconds

  // Fetch preview URL when component loads
  useEffect(() => {
    const fetchPreview = async () => {
      if (!track) return;
      
      try {
        console.log(`🎵 Fetching preview for "${track.title}" by ${track.artists?.[0]?.name}...`);
        
        const fetchedPreviewInfo = await itunesApiService.getTrackPreviewInfo(track);
        
        if (fetchedPreviewInfo.canPreview && fetchedPreviewInfo.previewUrl) {
          setPreviewInfo(fetchedPreviewInfo);
          setAudioReady(true);
          setAudioError(null);
          console.log('✅ Preview found:', fetchedPreviewInfo.actualTrack, 'from', fetchedPreviewInfo.source);
        } else {
          setAudioError('No preview available for this track');
          setAudioReady(false);
          setPreviewInfo(null);
          console.warn('⚠️ No preview URL available');
        }
      } catch (error) {
        console.error('❌ Failed to fetch preview:', error);
        setAudioError(error.message);
        setAudioReady(false);
      }
    };

    fetchPreview();

    // Capture ref values at the time the effect runs
    const currentAudio = audioRef.current;
    const currentInterval = intervalRef.current;
    const currentSnippetTimeout = snippetTimeoutRef.current;

    // Cleanup on unmount
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
      if (currentInterval) {
        clearInterval(currentInterval);
      }
      if (currentSnippetTimeout) {
        clearTimeout(currentSnippetTimeout);
      }
    };
  }, [track]);

  // Reset when track changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasPlayed(false);
    setPreviewInfo(null);
    
    // Generate new random start position within preview
    const previewDuration = 30;
    const maxStart = previewDuration - snippetDuration;
    const randomStart = Math.floor(Math.random() * maxStart);
    setSnippetStart(randomStart);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [track?.id]);


  // Play real audio preview
  const playSnippet = async () => {
    if (!track || !audioRef.current) {
      console.error('❌ No track or audio ref available');
      return;
    }

    if (!previewInfo?.previewUrl || !audioReady) {
      console.warn('⚠️ No preview URL available for this track');
      setAudioError('No preview available for this track');
      return;
    }

    try {
      setIsPlaying(true);
      setHasPlayed(true);
      setCurrentTime(0);
      
      const audio = audioRef.current;
      
      // Set up audio source and properties
      audio.src = previewInfo.previewUrl;
      audio.volume = 0.8;
      audio.preload = 'auto';
      
      // Wait for audio to load enough data
      await new Promise((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (e) => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error('Audio failed to load'));
        };
        
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
        
        // If already ready, resolve immediately
        if (audio.readyState >= 3) {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        }
      });
      
      // Set start time within preview
      audio.currentTime = snippetStart;
      await audio.play();
      
      // Track progress with more precise timing
      const startTime = performance.now();
      const trackProgress = () => {
        if (!isPlaying) return;
        
        const elapsed = (performance.now() - startTime) / 1000;
        
        if (elapsed >= snippetDuration) {
          setCurrentTime(snippetDuration);
          stopSnippet();
          if (onSnippetEnd) onSnippetEnd();
          return;
        }
        
        setCurrentTime(elapsed);
        requestAnimationFrame(trackProgress);
      };
      
      requestAnimationFrame(trackProgress);
      
      // Safety timeout to stop after exactly 5 seconds
      snippetTimeoutRef.current = setTimeout(() => {
        stopSnippet();
        if (onSnippetEnd) onSnippetEnd();
      }, snippetDuration * 1000);
      
    } catch (error) {
      console.error('🔴 Audio playback failed:', error);
      setAudioError('Playback failed: ' + error.message);
      setIsPlaying(false);
    }
  };



  const stopSnippet = () => {
    setIsPlaying(false);
    
    // Stop audio playback
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    
    // Clear timeout
    if (snippetTimeoutRef.current) {
      clearTimeout(snippetTimeoutRef.current);
      snippetTimeoutRef.current = null;
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
    
    // Shuffle within the 30-second preview
    const previewDuration = 30;
    const maxStart = previewDuration - snippetDuration;
    const newRandomStart = Math.floor(Math.random() * maxStart);
    
    setSnippetStart(newRandomStart);
    setCurrentTime(0);
    
    // Automatically play the new snippet
    setTimeout(() => playSnippet(), 100);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    // Capture ref value at the time the effect runs
    const currentInterval = intervalRef.current;
    
    return () => {
      if (currentInterval) {
        clearInterval(currentInterval);
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
          <p className="text-green-400 font-semibold text-lg">
            {(() => {
              const albumTitle = track?.album?.title || 'Unknown Album';
              const trackTitle = track?.title || '';
              
              // Enhanced single detection - same logic as in Game.js
              const isSingle = 
                albumTitle.toLowerCase().includes('single') ||
                albumTitle.toLowerCase() === trackTitle.toLowerCase() ||
                albumTitle.toLowerCase().includes(' - single') ||
                albumTitle.toLowerCase().includes('(single)') ||
                albumTitle.toLowerCase().includes('- ep') ||
                albumTitle.toLowerCase().includes('(ep)') ||
                // Check if album title contains the track title (likely a single)
                albumTitle.toLowerCase().includes(trackTitle.toLowerCase()) ||
                // Check if track title contains album title (reverse case)
                trackTitle.toLowerCase().includes(albumTitle.toLowerCase()) ||
                // Common single indicators
                albumTitle.toLowerCase().includes('remix') ||
                albumTitle.toLowerCase().includes('feat.') ||
                albumTitle.toLowerCase().includes('featuring') ||
                // If album has very few tracks, likely a single/EP
                albumTitle.split(' ').length <= 3;
              
              return isSingle ? 'Single Release' : albumTitle;
            })()}
          </p>
          <p className="text-green-200/80 text-xs mt-1">
            Playing from 0:{snippetStart.toString().padStart(2,'0')} - 0:{(snippetStart + snippetDuration).toString().padStart(2,'0')}
          </p>
        </div>
        
        {/* Audio Status */}
        {audioError && (
          <div className="mb-4 p-2 bg-red-600/20 border border-red-500/30 rounded">
            <p className="text-red-300 text-xs">
              ❌ {audioError}
            </p>
          </div>
        )}
        
        {audioReady && previewInfo?.previewUrl && !audioError && (
          <div className="mb-4 p-2 bg-green-600/20 border border-green-500/30 rounded">
            <p className="text-green-300 text-xs">
              🎵 Audio preview ready! Click play to hear 5 seconds.
            </p>
          </div>
        )}
        
        {!previewInfo && !audioError && (
          <div className="mb-4 p-2 bg-yellow-600/20 border border-yellow-500/30 rounded">
            <p className="text-yellow-300 text-xs">
              🔍 Searching for preview across multiple sources...
            </p>
          </div>
        )}
        
        
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
            {audioReady && previewInfo?.previewUrl ? (
              <>🎵 <strong>Audio Preview:</strong> 30-second snippet ready to play!</>
            ) : (
              <>⚠️ <strong>No Audio:</strong> Preview not available for this track.</>
            )}
            {hasPlayed && <span className="block mt-1">Listen carefully and make your best guess!</span>}
          </p>
          
        </div>

        {hasPlayed && (
          <p className="text-green-400 text-sm mt-3">
            ✨ Snippet played! Now make your guess based on what you heard
          </p>
        )}
      </div>

      {/* Audio element for preview playback */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onEnded={stopSnippet}
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default TrackPlayer;

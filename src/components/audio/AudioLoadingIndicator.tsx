/**
 * Audio Loading Indicator
 * Shows when audio is preloading
 */

'use client';

import { useEffect, useState } from 'react';
import { getAudioManager } from '@/lib/audio/AudioManager';

export function AudioLoadingIndicator() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount] = useState(10); // Actual number of critical sounds being preloaded

  useEffect(() => {
    const audioManager = getAudioManager();

    // Check loading status
    const checkLoading = setInterval(() => {
      const loaded = audioManager.state.loadedTracks.size;
      setLoadedCount(loaded);

      // Hide when we have at least 3 sounds loaded (enough to play)
      if (loaded >= 3 || !audioManager.state.loading) {
        setIsLoading(false);
        clearInterval(checkLoading);
      }
    }, 100);

    // Auto-hide after 2 seconds regardless (faster)
    const timeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(checkLoading);
    }, 2000);

    return () => {
      clearInterval(checkLoading);
      clearTimeout(timeout);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-mi-black/90 border border-mi-cyber-green/50 rounded-lg p-3 shadow-lg animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-mi-cyber-green rounded-full animate-ping" />
        <span className="text-xs text-mi-cyber-green font-mono">
          Loading audio... {loadedCount}/{totalCount}
        </span>
      </div>
    </div>
  );
}

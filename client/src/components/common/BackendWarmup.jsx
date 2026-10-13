import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../api/client';

export default function BackendWarmup() {
  const [isWarmingUp, setIsWarmingUp] = useState(false);

  useEffect(() => {
    let timer = setTimeout(() => {
      // If after 2.5s no response, show friendly wake-up banner
      setIsWarmingUp(true);
    }, 2500);

    // Ping health check
    apiRequest('/health')
      .then(() => {
        clearTimeout(timer);
        setIsWarmingUp(false);
      })
      .catch(() => {
        // Continue waiting
      });

    return () => clearTimeout(timer);
  }, []);

  if (!isWarmingUp) return null;

  return (
    <div className="bg-amber-500 text-charcoal-900 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-fade-in text-center">
      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
      <span>
        Starting up our cloud servers (takes ~15-20 seconds on first visit). Thank you for your patience!
      </span>
    </div>
  );
}

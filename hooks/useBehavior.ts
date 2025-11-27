import { useState, useEffect, useRef } from 'react';
import { BehaviorProfile } from '../types';

export const useBehaviorTracking = () => {
  const [metrics, setMetrics] = useState<BehaviorProfile>({
    click_speed_ms: 0,
    form_fill_time_s: 0,
    pages_visited: 1, // Single page app context
    session_duration_s: 0
  });

  const startTime = useRef(Date.now());
  const clickTimes = useRef<number[]>([]);
  const lastClickTime = useRef<number>(0);
  
  // Track session duration
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        session_duration_s: Math.floor((Date.now() - startTime.current) / 1000)
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track clicks to calculate speed
  useEffect(() => {
    const handleClick = () => {
      const now = Date.now();
      
      if (lastClickTime.current > 0) {
        const diff = now - lastClickTime.current;
        // Filter out potential double-clicks that are too fast to be separate intentional interactions
        if (diff > 50) {
          clickTimes.current.push(diff);
          
          // Keep only last 10 clicks for a rolling average
          if (clickTimes.current.length > 10) clickTimes.current.shift();

          // Calculate average speed
          const avg = clickTimes.current.reduce((a, b) => a + b, 0) / clickTimes.current.length;
          setMetrics(prev => ({ ...prev, click_speed_ms: Math.round(avg) }));
        }
      }
      lastClickTime.current = now;
    };

    window.addEventListener('mouseup', handleClick);
    return () => window.removeEventListener('mouseup', handleClick);
  }, []);

  return metrics;
};
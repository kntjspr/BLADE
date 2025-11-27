import React, { useEffect, useState } from 'react';
import { Activity, Fingerprint, Globe, MousePointer, Wifi, Shield } from 'lucide-react';
import { getBrowserProfile, getPublicIP } from '../services/fingerprint';
import { useBehaviorTracking } from '../hooks/useBehavior';
import { BrowserProfile, SessionData } from '../types';

interface LiveMonitorProps {
  onCapture: (data: SessionData) => void;
}

export const LiveMonitor: React.FC<LiveMonitorProps> = ({ onCapture }) => {
  const [browserData, setBrowserData] = useState<BrowserProfile | null>(null);
  const [ip, setIp] = useState<string>('...');
  const behavior = useBehaviorTracking();
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const load = async () => {
      const profile = await getBrowserProfile();
      setBrowserData(profile);
      const publicIp = await getPublicIP();
      setIp(publicIp);
      setIsScanning(false);
    };
    load();
  }, []);

  const handleCapture = () => {
    if (!browserData) return;
    
    const session: SessionData = {
      session_id: `live-${Date.now().toString().slice(-6)}`,
      ip,
      browser: browserData,
      behavior: {
          ...behavior,
          click_speed_ms: behavior.click_speed_ms === 0 ? 250 : behavior.click_speed_ms,
          form_fill_time_s: behavior.form_fill_time_s === 0 ? Math.min(behavior.session_duration_s, 5) : behavior.form_fill_time_s
      }
    };
    onCapture(session);
  };

  return (
    <div className="space-y-0 h-full flex flex-col bg-black p-4">
      <div className="flex-1 space-y-6 font-mono overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between text-xs uppercase font-bold text-zinc-500 tracking-widest border-b border-zinc-800 pb-2">
          <span>// SENSOR_ARRAY_STATUS</span>
          <span className={`flex items-center gap-2 ${isScanning ? 'text-white' : 'text-zinc-400'}`}>
            [{isScanning ? 'SCANNING' : 'ONLINE'}]
          </span>
        </div>

        {/* IP & Location */}
        <div className="group">
          <div className="flex items-center gap-2 mb-2 text-zinc-300 text-xs uppercase tracking-widest">
            <span className="text-zinc-600">::</span> Network_Identity
          </div>
          <div className="pl-4 border-l border-zinc-800 space-y-1">
            <div className="text-sm text-white">{ip}</div>
            <div className="text-xs text-zinc-600 flex items-center gap-2">
               <span>LOC_TIME:</span> 
               {browserData?.timezone || '...'}
            </div>
          </div>
        </div>

        {/* Browser Fingerprint */}
        <div className="group">
          <div className="flex items-center gap-2 mb-2 text-zinc-300 text-xs uppercase tracking-widest">
            <span className="text-zinc-600">::</span> Device_Print
          </div>
          <div className="pl-4 border-l border-zinc-800">
            <div className="grid grid-cols-1 gap-2 mt-2">
                <div className="flex justify-between items-center border border-zinc-900 p-2">
                    <div className="text-[10px] text-zinc-600 uppercase">Canvas_Hash</div>
                    <div className="text-xs text-zinc-400 truncate max-w-[150px]">
                        {browserData?.canvas_hash || '...'}
                    </div>
                </div>
                <div className="flex justify-between items-center border border-zinc-900 p-2">
                    <div className="text-[10px] text-zinc-600 uppercase">Fonts</div>
                    <div className="text-xs text-zinc-400">
                        {browserData?.fonts.length || 0} detected
                    </div>
                </div>
            </div>
             <div className="mt-2 text-[10px] text-zinc-700 truncate font-mono" title={browserData?.user_agent}>
                UA: {browserData?.user_agent || "..."}
            </div>
          </div>
        </div>

        {/* Behavior */}
        <div className="group">
          <div className="flex items-center gap-2 mb-2 text-zinc-300 text-xs uppercase tracking-widest">
            <span className="text-zinc-600">::</span> Behavior_Metrics
          </div>
          <div className="pl-4 border-l border-zinc-800">
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                <div className="border border-zinc-800 p-2">
                    <div className="text-[10px] text-zinc-600 uppercase">Click_Rate</div>
                    <div className="text-sm text-white font-bold mt-1">
                        {behavior.click_speed_ms}ms
                    </div>
                </div>
                <div className="border border-zinc-800 p-2">
                    <div className="text-[10px] text-zinc-600 uppercase">Duration</div>
                    <div className="text-sm text-white font-bold mt-1">
                        {behavior.session_duration_s}s
                    </div>
                </div>
                <div className="border border-zinc-800 p-2 flex items-center justify-center">
                   <Activity className="w-4 h-4 text-zinc-400 animate-pulse"/>
                </div>
            </div>
          </div>
        </div>

      </div>
      
      <button 
        onClick={handleCapture}
        disabled={isScanning}
        className="w-full mt-4 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-xs font-bold uppercase tracking-widest py-4 transition-colors border-t border-zinc-800"
      >
         {isScanning ? 'INITIALIZING...' : '[ CAPTURE_SESSION_DATA ]'}
      </button>
    </div>
  );
};
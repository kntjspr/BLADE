import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'red' | 'white';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, description, color = 'white' }) => {
  const colorClasses = {
    red: 'border-red-900 text-red-500',
    white: 'border-zinc-800 text-white',
  };

  return (
    <div className={`bg-black p-6 border border-zinc-800 hover:border-white transition-colors group ${color === 'red' ? 'border-red-900/50' : ''}`}>
      <h3 className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-2 group-hover:text-zinc-300">
        [ {title} ]
      </h3>
      <div className={`text-2xl font-bold font-mono ${color === 'red' ? 'text-red-600' : 'text-white'}`}>
        {value}
      </div>
      {description && (
        <p className="mt-2 text-zinc-600 text-[10px] uppercase tracking-wide border-t border-dashed border-zinc-800 pt-2">
          // {description}
        </p>
      )}
    </div>
  );
};
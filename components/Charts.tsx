import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis, Legend } from 'recharts';
import { AnalysisResult } from '../types';

interface ChartsProps {
  results: AnalysisResult[];
}

export const RiskDistributionChart: React.FC<ChartsProps> = ({ results }) => {
  // Bucket data into Low, Medium, High
  const data = [
    { name: 'LOW', count: 0, color: '#3f3f46' }, // zinc-700
    { name: 'MED', count: 0, color: '#a1a1aa' }, // zinc-400
    { name: 'HIGH', count: 0, color: '#ef4444' }, // red-500
  ];

  results.forEach(r => {
    if (r.risk_score < 0.4) data[0].count++;
    else if (r.risk_score < 0.8) data[1].count++;
    else data[2].count++;
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
          <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} fontFamily="monospace" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', color: '#f4f4f5', fontFamily: 'monospace', textTransform: 'uppercase' }}
            cursor={{fill: '#27272a', opacity: 0.5}}
          />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke={index === 2 ? '#7f1d1d' : 'none'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ClusterScatterChart: React.FC<ChartsProps> = ({ results }) => {
  
  const data = results.map((r, i) => ({
    id: r.session_id,
    risk: r.risk_score * 100,
    index: i,
    cluster: r.cluster_id || 'None',
    isFlagged: r.flagged
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis type="number" dataKey="index" name="Session" stroke="#71717a" tick={false} axisLine={false} />
          <YAxis type="number" dataKey="risk" name="Risk" unit="%" stroke="#71717a" axisLine={false} fontFamily="monospace" fontSize={10} />
          <ZAxis type="category" dataKey="cluster" name="Cluster" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-black border border-zinc-800 p-2 text-xs text-zinc-300 font-mono uppercase">
                    <p className="text-white font-bold">ID: {data.id}</p>
                    <p>RISK: {data.risk}%</p>
                    <p>CLUSTER: {data.cluster}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase' }}
          />
          <Scatter name="Safe" data={data.filter(d => !d.isFlagged)} fill="#52525b" shape="square" />
          <Scatter name="Flagged" data={data.filter(d => d.isFlagged)} fill="#ef4444" shape="cross" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
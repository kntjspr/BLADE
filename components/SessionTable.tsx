import React from 'react';
import { AnalysisResult } from '../types';

interface SessionTableProps {
  results: AnalysisResult[];
}

export const SessionTable: React.FC<SessionTableProps> = ({ results }) => {
  return (
    <div className="overflow-x-auto bg-black">
      <table className="w-full text-left text-xs text-zinc-400 font-mono border-collapse">
        <thead className="bg-black border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 font-normal border-r border-zinc-900">ID</th>
            <th className="px-6 py-4 font-normal border-r border-zinc-900">Risk_Level</th>
            <th className="px-6 py-4 font-normal border-r border-zinc-900">Status</th>
            <th className="px-6 py-4 font-normal border-r border-zinc-900">Cluster_Ref</th>
            <th className="px-6 py-4 font-normal">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {results.map((item) => (
            <tr key={item.session_id} className="hover:bg-zinc-900/30 transition-none group">
              <td className="px-6 py-4 border-r border-zinc-900 text-zinc-300 group-hover:text-white">
                {item.session_id}
              </td>
              <td className="px-6 py-4 border-r border-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-zinc-900 border border-zinc-800">
                    <div 
                      className={`h-full ${
                        item.risk_score > 0.8 ? 'bg-red-600' : 
                        item.risk_score > 0.5 ? 'bg-zinc-400' : 'bg-zinc-700'
                      }`} 
                      style={{ width: `${item.risk_score * 100}%` }}
                    ></div>
                  </div>
                  <span className={`font-bold ${item.risk_score > 0.8 ? 'text-red-500' : 'text-zinc-500'}`}>
                    {(item.risk_score * 100).toFixed(0)}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 border-r border-zinc-900">
                {item.flagged ? (
                  <span className="text-red-600 font-bold uppercase tracking-wider animate-pulse">
                    [ FLAGGED ]
                  </span>
                ) : (
                  <span className="text-zinc-600 uppercase tracking-wider">
                    PASS
                  </span>
                )}
              </td>
              <td className="px-6 py-4 border-r border-zinc-900">
                 {item.cluster_id ? (
                   <span className="text-zinc-300 bg-zinc-900 px-1 border border-zinc-700">
                     #{item.cluster_id}
                   </span>
                 ) : <span className="text-zinc-800">--</span>}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {item.reasons.map((reason, idx) => (
                    <span key={idx} className="text-[10px] border border-zinc-800 px-2 py-1 text-zinc-500 uppercase">
                      {reason}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
import React, { useState } from 'react';
import { DisplayPage } from './components/DisplayPage';
import { PlaygroundPage } from './components/PlaygroundPage';
import { CompliancePage } from './components/CompliancePage';
import { SessionManager } from './components/SessionManager';
import { Skull, Eye, FlaskConical, FileText, Database } from 'lucide-react';


type Page = 'display' | 'playground' | 'compliance' | 'sessions';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('display');

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-mono selection:bg-white selection:text-black">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skull className="text-white w-5 h-5" />
            <h1 className="text-lg tracking-[0.2em] text-white font-bold uppercase">
              BLADE<span className="text-zinc-600"></span>
            </h1>
            <div className="hidden md:block text-[10px] text-zinc-600 uppercase tracking-wider">
              Browser Logging & Anomaly Detection Engine
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 border border-zinc-800 py-1 px-3 uppercase tracking-widest">
              <span className="w-2 h-2 bg-zinc-500 animate-pulse"></span>
              System Online
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-black">
        <div className="max-w-full mx-auto px-6 flex gap-2">
          <button
            onClick={() => setCurrentPage('display')}
            className={`py-3 px-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-none border-b-2 ${currentPage === 'display'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-600 hover:text-zinc-300'
              }`}
          >
            <Eye className="w-4 h-4" />
            [ Display ]
          </button>
          <button
            onClick={() => setCurrentPage('playground')}
            className={`py-3 px-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-none border-b-2 ${currentPage === 'playground'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-600 hover:text-zinc-300'
              }`}
          >
            <FlaskConical className="w-4 h-4" />
            [ Playground ]
          </button>
          <button
            onClick={() => setCurrentPage('compliance')}
            className={`py-3 px-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-none border-b-2 ${currentPage === 'compliance'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-600 hover:text-zinc-300'
              }`}
          >
            <FileText className="w-4 h-4" />
            [ Compliance ]
          </button>
          <button
            onClick={() => setCurrentPage('sessions')}
            className={`py-3 px-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-none border-b-2 ${currentPage === 'sessions'
              ? 'border-white text-white'
              : 'border-transparent text-zinc-600 hover:text-zinc-300'
              }`}
          >
            <Database className="w-4 h-4" />
            [ Sessions ]
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-6 py-8">
        {currentPage === 'display' ? (
          <DisplayPage />
        ) : currentPage === 'playground' ? (
          <PlaygroundPage />
        ) : currentPage === 'sessions' ? (
          <SessionManager />
        ) : (
          <CompliancePage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-black mt-16">
        <div className="max-w-full mx-auto px-6 py-4 text-center text-xs text-zinc-600 uppercase tracking-widest">
          <span className="text-zinc-600">::</span> Browser Fingerprinting & Detection System <span className="text-zinc-600">::</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
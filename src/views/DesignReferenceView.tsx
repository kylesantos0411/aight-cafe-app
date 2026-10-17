import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FigmaArtboardView } from '../components/FigmaArtboardView';

export const DesignReferenceView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      <div className="bg-[#221611] text-[#FAF8F5] px-6 py-2 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold">Design Reference</span>
          <span className="text-[#A49588]">· 15 Artboards from AIGHT CAFE APP.fig</span>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
        >
          ← Return to Live Customer App
        </button>
      </div>
      <FigmaArtboardView />
    </div>
  );
};

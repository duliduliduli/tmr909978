"use client";

import { useAppStore } from '@/lib/store';

export function LanguageSwitch() {
  const { language, setLanguage } = useAppStore();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-bold transition-colors ${language === 'en' ? 'text-white' : 'text-gray-500'}`}>
        EN
      </span>
      <button
        onClick={toggleLanguage}
        className="relative w-16 h-8 rounded-full overflow-hidden border-2 border-white/30 transition-all duration-300 hover:border-white/50 shadow-lg"
        aria-label={`Switch language to ${language === 'en' ? 'Spanish' : 'English'}`}
      >
        {/* Flag backgrounds */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-in-out flex"
          style={{
            width: '200%',
            transform: language === 'en' ? 'translateX(0)' : 'translateX(-50%)',
          }}
        >
          {/* UK Flag background (left half) */}
          <div className="w-1/2 h-full relative">
            {/* Blue background */}
            <div className="absolute inset-0 bg-[#012169]" />
            {/* White diagonal stripes */}
            <div className="absolute inset-0" style={{
              background: `linear-gradient(to bottom right, transparent 40%, white 40%, white 45%, transparent 45%),
                          linear-gradient(to top right, transparent 40%, white 40%, white 45%, transparent 45%)`
            }} />
            {/* Red diagonal stripes */}
            <div className="absolute inset-0" style={{
              background: `linear-gradient(to bottom right, transparent 42%, #C8102E 42%, #C8102E 46%, transparent 46%),
                          linear-gradient(to top right, transparent 42%, #C8102E 42%, #C8102E 46%, transparent 46%)`
            }} />
            {/* White cross */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-full bg-white" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-2 bg-white" />
            {/* Red cross */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-[#C8102E]" />
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-[#C8102E]" />
          </div>

          {/* Spanish Flag background (right half) */}
          <div className="w-1/2 h-full relative">
            <div className="absolute inset-x-0 top-0 h-1/4 bg-[#c60b1e]" />
            <div className="absolute inset-x-0 top-1/4 h-2/4 bg-[#ffc400]" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#c60b1e]" />
          </div>
        </div>

        {/* Toggle pill */}
        <div
          className={`
            absolute top-0.5 w-7 h-7 rounded-full bg-white shadow-md
            transition-all duration-300 ease-in-out
            flex items-center justify-center
            ${language === 'en' ? 'left-0.5' : 'left-[calc(100%-30px)]'}
          `}
        >
          <span className="text-[10px] font-bold text-gray-800">
            {language === 'en' ? 'EN' : 'ES'}
          </span>
        </div>
      </button>
      <span className={`text-sm font-bold transition-colors ${language === 'es' ? 'text-white' : 'text-gray-500'}`}>
        ES
      </span>
    </div>
  );
}

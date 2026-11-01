/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types/game';
import { Download, Share, X, PlusSquare } from 'lucide-react';

interface PWAInstallPromptProps {
  language: Language;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // Chromium / Android / Desktop Install Banner
  if (isInstallable) {
    return (
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-2 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center text-stone-950 shrink-0 font-bold text-xs">
            బ
          </div>
          <span className="text-amber-200 truncate">
            {language === 'te'
              ? 'ఫోన్‌లో మొబైల్ యాప్‌గా ఇన్‌స్టాల్ చేసుకోండి (PWA)'
              : 'Install Bara Katta as an App on your device'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg shadow-sm cursor-pointer active:scale-95 transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'ఇన్‌స్టాల్' : 'Install'}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-stone-400 hover:text-white"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari "Add to Home Screen" Trigger
  if (isIOS) {
    return (
      <>
        <div className="bg-stone-900/90 border-b border-stone-800 px-3 py-1.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-stone-300 truncate text-[11px]">
              {language === 'te'
                ? 'iPhone / iPad హోమ్ స్క్రీన్‌కి యాప్‌ను జోడించండి'
                : 'Add to iPhone / iPad Home Screen for fullscreen app experience'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md border border-amber-500/40 text-amber-300 font-semibold cursor-pointer hover:bg-amber-500/10"
            >
              <Share className="w-3 h-3" />
              <span>{language === 'te' ? 'ఎలా జోడించాలి?' : 'Add to Home'}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Guided iOS Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-amber-500/30 p-5 shadow-2xl text-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h3 className="font-bold text-amber-300 font-cinzel text-sm">
                  {language === 'te' ? 'iOS లో ఇన్‌స్టాల్ చేసే విధానం' : 'Install on iPhone / iPad'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    {language === 'te'
                      ? 'Safari బ్రౌజర్ దిగువన ఉన్న'
                      : 'Tap the'}{' '}
                    <strong className="text-white inline-flex items-center gap-1 bg-stone-800 px-1.5 py-0.5 rounded">
                      <Share className="w-3 h-3 text-amber-400 inline" /> Share
                    </strong>{' '}
                    {language === 'te' ? 'బటన్‌ను నొక్కండి.' : 'button in the Safari toolbar.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    {language === 'te'
                      ? 'మెనూను కిందకు జరిపి'
                      : 'Scroll down and select'}{' '}
                    <strong className="text-white inline-flex items-center gap-1 bg-stone-800 px-1.5 py-0.5 rounded">
                      <PlusSquare className="w-3 h-3 text-amber-400 inline" />{' '}
                      {language === 'te' ? 'హోమ్ స్క్రీన్‌కి జోడించు' : 'Add to Home Screen'}
                    </strong>
                    .
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    {language === 'te'
                      ? 'ఎగువ కుడివైపున ఉన్న "Add" నొక్కండి. యాప్ హోమ్ స్క్రీన్‌లో ప్రత్యక్షమవుతుంది!'
                      : 'Tap "Add" in the top right. Bara Katta will launch like a native app!'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {language === 'te' ? 'సరే (Got it)' : 'Understood'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

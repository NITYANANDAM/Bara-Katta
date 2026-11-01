/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types/game';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC<{ language: Language }> = ({ language }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-14 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white shadow-lg border border-amber-400/40">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>
        {language === 'te'
          ? 'ఆఫ్‌లైన్ మోడ్ — ఇంటర్నెట్ లేకుండా స్థానికంగా ఆడుతున్నారు.'
          : 'Offline Mode — Playing locally without network.'}
      </span>
    </div>
  );
};

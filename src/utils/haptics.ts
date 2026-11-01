/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'bonus' | 'victory';

export function triggerHaptic(style: HapticStyle = 'light') {
  if (typeof window === 'undefined' || !window.navigator || !('vibrate' in window.navigator)) {
    return;
  }

  try {
    switch (style) {
      case 'light':
        window.navigator.vibrate(15);
        break;
      case 'medium':
        window.navigator.vibrate([25, 20, 25]);
        break;
      case 'heavy':
        // Capture / Daadi
        window.navigator.vibrate([60, 40, 90]);
        break;
      case 'bonus':
        // Chowka / Ashta
        window.navigator.vibrate([30, 30, 40, 30, 60]);
        break;
      case 'victory':
        window.navigator.vibrate([100, 50, 100, 50, 200]);
        break;
    }
  } catch {
    // Graceful ignore if unsupported
  }
}

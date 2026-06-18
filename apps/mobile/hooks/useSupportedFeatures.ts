import { useMemo } from 'react';
import { useHardwareDetection } from './useHardwareDetection';

export interface FeatureSupport {
  isSupported: boolean;
  reason?: string;
}

export interface AppFeatures {
  localWhisper: FeatureSupport;
  haptics: FeatureSupport;
}

export function useSupportedFeatures(): AppFeatures {
  const hw = useHardwareDetection();

  return useMemo(() => {
    let whisperSupport: FeatureSupport = { isSupported: true };

    if (hw.isSimulator) {
      whisperSupport = { isSupported: true, reason: "Virtual device (performance may be reduced)" };
    } else if (!hw.isSupportedRam) {
      whisperSupport = { isSupported: false, reason: "Requires at least 4GB of RAM for stable inference." };
    } else if (!hw.isSupportedCpu) {
      whisperSupport = { isSupported: false, reason: "CPU architecture unsupported or known to have issues with local engine." };
    }

    return {
      localWhisper: whisperSupport,
      haptics: { isSupported: true }, // Usually supported natively, handled internally by expo-haptics fallback
    };
  }, [hw]);
}

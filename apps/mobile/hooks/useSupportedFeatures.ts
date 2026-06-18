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
      whisperSupport = { isSupported: false, reason: "Simulators lack audio hardware acceleration." };
    } else if (hw.isExynosS21) {
      whisperSupport = { isSupported: false, reason: "Exynos 2100 processor has known compatibility issues with ggml engine." };
    } else if (hw.isLowMemory) {
      whisperSupport = { isSupported: false, reason: "Requires at least 4GB of RAM for stable inference." };
    }

    return {
      localWhisper: whisperSupport,
      haptics: { isSupported: true }, // Usually supported natively, handled internally by expo-haptics fallback
    };
  }, [hw]);
}

import { useMemo } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export interface HardwareProfile {
  modelName: string;
  osName: string;
  osVersion: string;
  totalMemoryGB: number;
  isExynosS21: boolean;
  isLowMemory: boolean;
  isSimulator: boolean;
}

export function useHardwareDetection(): HardwareProfile {
  return useMemo(() => {
    const model = Device.modelName || "Unknown Device";
    const osName = Device.osName || Platform.OS;
    const osVersion = Device.osVersion || String(Platform.Version);
    const totalMemoryBytes = Device.totalMemory || 0;
    const totalMemoryGB = totalMemoryBytes > 0 ? Math.round(totalMemoryBytes / (1024 * 1024 * 1024)) : 0;
    
    // Exynos S21 variants (Global) are known to struggle with ggml-base/tiny
    const isExynosS21 = Platform.OS === 'android' && 
      (model.includes("SM-G991B") || model.includes("SM-G996B") || model.includes("SM-G998B"));
      
    const isLowMemory = totalMemoryGB > 0 && totalMemoryGB < 4;
    const isSimulator = !Device.isDevice;

    return {
      modelName: model,
      osName,
      osVersion,
      totalMemoryGB,
      isExynosS21,
      isLowMemory,
      isSimulator,
    };
  }, []);
}

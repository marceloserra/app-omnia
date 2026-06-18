import { useMemo } from 'react';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { getDeviceSpec } from '../lib/deviceSpecs';

export interface HardwareProfile {
  modelName: string;
  osName: string;
  osVersion: string;
  totalMemoryGB: number;
  cpu: string;
  gpu: string;
  npu: string;
  isSupportedCpu: boolean;
  isSupportedRam: boolean;
  isSimulator: boolean;
}

export function useHardwareDetection(): HardwareProfile {
  return useMemo(() => {
    const model = Device.modelName || "Unknown Device";
    const osName = Device.osName || Platform.OS;
    const osVersion = Device.osVersion || String(Platform.Version);
    const totalMemoryBytes = Device.totalMemory || 0;
    const totalMemoryGB = totalMemoryBytes > 0 ? Math.round(totalMemoryBytes / (1024 * 1024 * 1024)) : 0;
    
    // Check known specs
    const specs = getDeviceSpec(model);
    
    // Explicit exclusions
    const isExynosS21 = Platform.OS === 'android' && 
      (model.includes("SM-G991B") || model.includes("SM-G996B") || model.includes("SM-G998B"));
    
    // Evaluate Support Status
    const isSupportedCpu = specs.isSupportedCpu && !isExynosS21;
    const isSupportedRam = totalMemoryGB >= 4; // Require at least 4GB RAM
    
    const isSimulator = !Device.isDevice;

    return {
      modelName: model,
      osName,
      osVersion,
      totalMemoryGB,
      cpu: specs.cpu,
      gpu: specs.gpu,
      npu: specs.npu,
      isSupportedCpu,
      isSupportedRam,
      isSimulator,
    };
  }, []);
}

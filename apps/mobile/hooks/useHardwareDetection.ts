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
    
    // Convert OS GiB to approximate advertised RAM
    const rawGB = totalMemoryBytes / (1024 * 1024 * 1024);
    let advertisedRAM = Math.ceil(rawGB);
    if (advertisedRAM === 5) advertisedRAM = 6;
    if (advertisedRAM > 8 && advertisedRAM <= 12) advertisedRAM = 12;
    if (advertisedRAM > 12 && advertisedRAM <= 16) advertisedRAM = 16;
    
    const totalMemoryGB = totalMemoryBytes > 0 ? advertisedRAM : 0;
    const isSimulator = !Device.isDevice;
    
    // Check known specs
    const brand = Device.brand || "";
    const archs = Device.supportedCpuArchitectures;
    const specs = getDeviceSpec(model, brand, archs);
    
    // Evaluate Support Status
    const isSupportedCpu = specs.isSupportedCpu;
    const isSupportedRam = totalMemoryGB >= 4; // Require at least 4GB RAM
    
    return {
      modelName: model,
      osName,
      osVersion,
      totalMemoryGB,
      cpu: isSimulator ? "Virtual CPU" : specs.cpu,
      gpu: isSimulator ? "Virtual GPU" : specs.gpu,
      npu: isSimulator ? "Unsupported" : specs.npu,
      isSupportedCpu,
      isSupportedRam,
      isSimulator,
    };
  }, []);
}

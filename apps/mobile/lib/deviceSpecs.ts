export interface DeviceHardwareSpec {
  cpu: string;
  gpu: string;
  npu: string;
  isSupportedCpu: boolean;
}

// A simple dictionary mapping known Device.modelName prefixes to their specs.
// This allows us to present a rich FAANG-like UI for known devices.
const appleSpecs: Record<string, DeviceHardwareSpec> = {
  "iPhone16": { cpu: "A17 Pro", gpu: "Apple GPU (6-core)", npu: "16-core Neural Engine", isSupportedCpu: true },
  "iPhone15": { cpu: "A16 Bionic", gpu: "Apple GPU (5-core)", npu: "16-core Neural Engine", isSupportedCpu: true },
  "iPhone14": { cpu: "A15 Bionic", gpu: "Apple GPU (5-core)", npu: "16-core Neural Engine", isSupportedCpu: true },
  "iPhone13": { cpu: "A15 Bionic", gpu: "Apple GPU (4-core)", npu: "16-core Neural Engine", isSupportedCpu: true },
  "iPhone12": { cpu: "A14 Bionic", gpu: "Apple GPU (4-core)", npu: "16-core Neural Engine", isSupportedCpu: true },
  "iPhone11": { cpu: "A13 Bionic", gpu: "Apple GPU (4-core)", npu: "8-core Neural Engine", isSupportedCpu: false }, // Older than iPhone 12 might struggle
  "iPad14": { cpu: "M2", gpu: "Apple GPU (10-core)", npu: "16-core Neural Engine", isSupportedCpu: true },
  "iPad13": { cpu: "M1", gpu: "Apple GPU (8-core)", npu: "16-core Neural Engine", isSupportedCpu: true },
};

const androidSpecs: Record<string, DeviceHardwareSpec> = {
  "SM-S92": { cpu: "Snapdragon 8 Gen 3", gpu: "Adreno 750", npu: "Hexagon NPU", isSupportedCpu: true }, // S24
  "SM-S91": { cpu: "Snapdragon 8 Gen 2", gpu: "Adreno 740", npu: "Hexagon NPU", isSupportedCpu: true }, // S23
  "SM-S90": { cpu: "Snapdragon 8 Gen 1", gpu: "Adreno 730", npu: "Hexagon NPU", isSupportedCpu: true }, // S22
  "Pixel 8": { cpu: "Google Tensor G3", gpu: "Mali-G715", npu: "Tensor TPU", isSupportedCpu: true },
  "Pixel 7": { cpu: "Google Tensor G2", gpu: "Mali-G710", npu: "Tensor TPU", isSupportedCpu: true },
  "Pixel 6": { cpu: "Google Tensor", gpu: "Mali-G78", npu: "Tensor TPU", isSupportedCpu: true },
};

export function getDeviceSpec(modelName: string, brand: string, archs: string[] | null): DeviceHardwareSpec {
  // Check Apple
  for (const [key, spec] of Object.entries(appleSpecs)) {
    if (modelName.startsWith(key)) return spec;
  }
  // Check Android
  for (const [key, spec] of Object.entries(androidSpecs)) {
    if (modelName.startsWith(key) || modelName.includes(key)) return spec;
  }
  
  // Generic Fallback
  const archString = archs && archs.length > 0 ? archs[0].toUpperCase() : "ARM";
  const brandString = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : "Generic";
  
  return {
    cpu: `${brandString} ${archString} Processor`,
    gpu: "Integrated GPU",
    npu: "Unsupported",
    isSupportedCpu: true, // Assume true for unknown Androids unless RAM fails
  };
}

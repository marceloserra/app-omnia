/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    compiler: 'typescript',
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      // Run prebuild and build using xcodebuild targeting the simulator
      build: 'npx expo prebuild --platform ios && xcodebuild -workspace ios/Omnia.xcworkspace -scheme Omnia -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Omnia.app'
    },
    'android.debug': {
      type: 'android.apk',
      // Run prebuild and compile debug APKs
      build: 'npx expo prebuild --platform android && cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 17 Pro'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Omnia_E2E_Emulator'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};

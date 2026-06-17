const fs = require("fs");
const path = require("path");
const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");

const NETWORK_SECURITY_CONFIG_FILE = "network_security_config.xml";

function withAndroidCleartextTraffic(config) {
  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults,
    );

    mainApplication.$["android:usesCleartextTraffic"] = "true";
    mainApplication.$["android:networkSecurityConfig"] =
      "@xml/network_security_config";

    return config;
  });

  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const sourcePath = path.join(
        config.modRequest.projectRoot,
        NETWORK_SECURITY_CONFIG_FILE,
      );
      const destinationDirectory = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );
      const destinationPath = path.join(
        destinationDirectory,
        NETWORK_SECURITY_CONFIG_FILE,
      );

      if (!fs.existsSync(sourcePath)) {
        throw new Error(
          `Missing Android network security config at ${sourcePath}`,
        );
      }

      fs.mkdirSync(destinationDirectory, { recursive: true });
      fs.copyFileSync(sourcePath, destinationPath);

      return config;
    },
  ]);

  return config;
}

module.exports = withAndroidCleartextTraffic;

const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

// Fix for react-native-syntax-highlighter looking for prism/light at the root
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("react-syntax-highlighter/prism") || moduleName.startsWith("react-syntax-highlighter/light")) {
    const newName = moduleName.replace("react-syntax-highlighter/", "react-syntax-highlighter/dist/cjs/");
    return context.resolveRequest(context, newName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

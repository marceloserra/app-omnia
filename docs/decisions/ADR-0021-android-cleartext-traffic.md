# ADR 0021: Android Cleartext Traffic for Local AI Providers

## Status
Accepted

## Context
The Omnia app is designed to connect to both cloud-based AI providers (like OpenAI via HTTPS) and local, on-premise AI providers (like Ollama, LMStudio, or custom servers). Local providers typically run on the user's local network (e.g., `http://192.168.1.X:11434` or `http://localhost:1234`) and do not have SSL/TLS certificates configured, meaning they rely on plain HTTP (cleartext) traffic.

Starting from Android 9 (API level 28), Google implemented a strict security policy that disables cleartext traffic (`usesCleartextTraffic="false"`) by default. 

During the development phase using Expo Go, this restriction is bypassed because the Expo development client explicitly allows cleartext traffic to support local Metro bundler connections. However, when building the final standalone production APK (v1.0.0), the Android security policy is enforced, causing all connections to local HTTP providers to be silently blocked or instantly rejected by the OS.

## Decision
We decided to explicitly opt out of the default Android cleartext traffic restriction by configuring `usesCleartextTraffic: true` in the Expo `app.json` configuration file.

```json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

This configuration tells the Expo prebuild process to inject `android:usesCleartextTraffic="true"` into the `<application>` tag of the generated `AndroidManifest.xml`.

## Consequences

### Positive
* **Functional Parity:** Users can successfully connect to their local AI models (Ollama, LMStudio, etc.) over their home network using standard HTTP addresses in the production release, exactly as they did during development.
* **Seamless UX:** Users do not need to set up reverse proxies, self-signed certificates, or local DNS records to use local models.

### Negative / Risks
* **Security Caveat:** The app is technically allowed to make HTTP requests to any domain, not just the local network. However, since the app only connects to endpoints explicitly defined by the user in the Settings screen (e.g., the OpenAI URL which defaults to `https://`, or a custom URL), the risk of accidental unencrypted data transmission is entirely controlled by the user's input.
* **Play Store Scrutiny:** Google Play Store automated reviews sometimes flag `usesCleartextTraffic="true"`. However, since our app is an AI client whose primary feature is connecting to user-defined local servers, we have a valid use case if manual review is required. 

## Alternatives Considered
1. **Network Security Config (XML):** Instead of a blanket `usesCleartextTraffic="true"`, we could use a custom `network_security_config.xml` to allow cleartext traffic *only* for local IPs (e.g., `192.168.*`, `10.*`). 
   * *Reason rejected:* Setting up a robust regex/IP range filter for all possible local network subnets via Expo config plugins is complex and brittle. The blanket approach is standard for developer/AI tools.
2. **Forcing HTTPS locally:** Requiring users to configure SSL on their Ollama/LMStudio instances.
   * *Reason rejected:* This creates a massive barrier to entry and ruins the "plug and play" UX of the mobile app.

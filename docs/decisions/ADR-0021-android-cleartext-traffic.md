# ADR 0021: Android Cleartext Traffic for Local AI Providers

## Status
Accepted

## Context
The Omnia app is designed to connect to both cloud-based AI providers (like OpenAI via HTTPS) and local, on-premise AI providers (like Ollama, LMStudio, or custom servers). Local providers typically run on the user's local network (e.g., `http://192.168.1.X:11434` or `http://localhost:1234`) and do not have SSL/TLS certificates configured, meaning they rely on plain HTTP (cleartext) traffic.

Starting from Android 9 (API level 28), Google implemented a strict security policy that disables cleartext traffic (`usesCleartextTraffic="false"`) by default. 

During the development phase using Expo Go, this restriction is bypassed because the Expo development client explicitly allows cleartext traffic to support local Metro bundler connections. However, when building the final standalone production APK (v1.0.0), the Android security policy is enforced, causing all connections to local HTTP providers to be silently blocked or instantly rejected by the OS.

## Decision
We explicitly opt out of the default Android cleartext traffic restriction in the final native APK.

The app keeps Expo's built-in Android flag in `apps/mobile/app.json`:

```json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

Release APK verification showed that this is not enough as an operational guarantee. A local Expo config plugin now owns the final generated Android manifest shape:

- `apps/mobile/plugins/with-android-cleartext-traffic.js`
- `apps/mobile/network_security_config.xml`

The plugin runs during `expo prebuild`, copies `network_security_config.xml` into `android/app/src/main/res/xml/network_security_config.xml`, and injects both attributes into the generated `<application>` tag:

```xml
android:usesCleartextTraffic="true"
android:networkSecurityConfig="@xml/network_security_config"
```

This keeps the intent visible in Expo config while making the final native manifest deterministic.

## Consequences

### Positive
* **Functional Parity:** Users can successfully connect to their local AI models (Ollama, LMStudio, etc.) over their home network using standard HTTP addresses in the production release, exactly as they did during development.
* **Seamless UX:** Users do not need to set up reverse proxies, self-signed certificates, or local DNS records to use local models.
* **Deterministic Prebuild:** The release pipeline now has an explicit file and manifest mutation that can be inspected after `expo prebuild`.

### Negative / Risks
* **Security Caveat:** The app is technically allowed to make HTTP requests to any domain, not just the local network. However, since the app only connects to endpoints explicitly defined by the user in the Settings screen (e.g., the OpenAI URL which defaults to `https://`, or a custom URL), the risk of accidental unencrypted data transmission is controlled by the user's input.
* **Play Store Scrutiny:** Google Play Store automated reviews sometimes flag `usesCleartextTraffic="true"`. However, since our app is an AI client whose primary feature is connecting to user-defined local servers, we have a valid use case if manual review is required. 
* **Plugin Maintenance:** The custom config plugin must be kept compatible with Expo config plugin APIs during SDK upgrades.

## Alternatives Considered
1. **Only `usesCleartextTraffic: true` in `app.json`:**
   * *Reason rejected:* This was already present and did not provide enough confidence for the final APK defect. We need a generated manifest assertion that can be inspected in CI or locally.
2. **Network Security Config (XML) restricted only to local IPs:**
   * *Reason rejected:* Android network security config does not support broad private-subnet wildcard matching in a way that cleanly covers `localhost`, emulator host aliases, `10.*`, `172.16.*`, `192.168.*`, and user-defined LAN hostnames. The app is a user-configured AI client, so the blanket cleartext opt-in is the practical MVP behavior.
3. **Forcing HTTPS locally:** Requiring users to configure SSL on their Ollama/LMStudio instances.
   * *Reason rejected:* This creates a massive barrier to entry and ruins the "plug and play" UX of the mobile app.

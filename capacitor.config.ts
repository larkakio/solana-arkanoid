import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.arkanoid.game",
  appName: "Arkanoid",
  webDir: "dist",
  android: {
    allowMixedContent: true,
  },
};

export default config;

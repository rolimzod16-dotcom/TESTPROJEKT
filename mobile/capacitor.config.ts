import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hivemonitor.app",
  appName: "HiveMonitor",
  webDir: "www",
  server: {
    url: "https://testprojekt-q4af.vercel.app/app",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#f5efe6",
  },
};

export default config;
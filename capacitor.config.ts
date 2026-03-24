import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.flowstate.app',
  appName: 'flowstate',
  webDir: 'out',
  server : {
    url: 'https://flowstate01-app.vercel.app/',
    cleartext: true,
  }
};

export default config;

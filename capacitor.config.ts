import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pt.ipvc.sempreabulir.app', // (Mantém o ID que já tens)
  appName: 'SempreABulir', // (Mantém o nome que já tens)
  webDir: 'www',
  // Adiciona este bloco de plugins:
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#f4c20d',
      style: 'LIGHT'
    }
  }
};

export default config;
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pt.ipvc.sempreabulir.app', // (Mantém o ID que já tens)
  appName: 'SempreABulir', // (Mantém o nome que já tens)
  webDir: 'www',
  // Adiciona este bloco de plugins:
  plugins: {
    StatusBar: {
      backgroundColor: '#f4c20d', // O teu Amarelo Académico
      style: 'LIGHT' // Coloca os ícones da bateria e horas a preto!
    }
  }
};

export default config;
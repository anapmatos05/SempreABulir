import { Component } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { filter } from 'rxjs/operators';

/**
 * Componente raiz da aplicação.
 * Responsável por configurar as definições nativas (ex: orientação, barra de estado)
 * e definir as rotas que aparecem no menu lateral.
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent {
  
  public appPages = [
    { title: 'Calendário', url: '/folder/calendario', icon: 'calendar' },
    { title: 'Tarefas', url: '/folder/tarefas', icon: 'checkbox' },
    { title: 'Grupos', url: '/folder/grupos', icon: 'people' }
  ];

  constructor(
    private platform: Platform,
    private router: Router,
    private popoverCtrl: PopoverController
  ) {
    this.iniciarApp();
    this.ouvirMudancasDeRota();
  }

  /**
   * Configuração de inicialização da aplicação:
   * 1. Aguarda que a plataforma Ionic esteja totalmente carregada.
   * 2. Bloqueia a orientação do ecrã para 'Portrait' se correr em ambiente nativo.
   * 3. Configura a Barra de Estado para não se sobrepor à aplicação e ter o fundo amarelo.
   */
  async iniciarApp() {
    await this.platform.ready();
    
    if (this.platform.is('capacitor')) {
      
      // BLOCO 1: Orientação do Ecrã
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (error) {
        console.log('A rotação só é bloqueada em ambiente nativo.');
      }

      // BLOCO 2: Barra de Estado (StatusBar / Notch)
      try {
        // Impede a aplicação de ficar escondida por trás da barra de notificações/câmara
        await StatusBar.setOverlaysWebView({ overlay: false });

        // Define a cor de fundo da barra para o teu Amarelo Académico
        await StatusBar.setBackgroundColor({ color: '#f4c20d' }); 

        // Como o amarelo é uma cor clara, força a hora e os ícones de bateria a ficarem escuros (Style.Light)
        await StatusBar.setStyle({ style: Style.Light });
      } catch (error) {
        console.log('A configuração da StatusBar só tem efeito no telemóvel.');
      }
      
    }
  }

  /**
   * INTERCEPTOR GLOBAL: Fecha qualquer popover automaticamente sempre que mudas de página
   */
  private ouvirMudancasDeRota() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(async () => {
      // Procura se existe algum popover ativo na aplicação e fecha-o imediatamente
      const popoverAtivo = await this.popoverCtrl.getTop();
      if (popoverAtivo) {
        await this.popoverCtrl.dismiss();
      }
    });
  }
}
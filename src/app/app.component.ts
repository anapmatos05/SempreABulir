import { Component } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { filter } from 'rxjs/operators';

/**
 * Componente raiz da aplicação.
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
    private popoverCtrl: PopoverController // Injeta o PopoverController global aqui
  ) {
    this.iniciarApp();
    this.ouvirMudancasDeRota();
  }

  async iniciarApp() {
    await this.platform.ready();
    if (this.platform.is('capacitor')) {
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (error) {
        console.log('A rotação só é bloqueada em ambiente nativo.');
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
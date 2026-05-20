import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface DiaSemana {
  nome: string;      // Ex: 'Seg', 'Ter'
  numero: number;    // Ex: 18, 19
  isHoje: boolean;   // Se for o dia de hoje, fica true
  dataCompleta: Date;
}

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false
})
export class FolderPage implements OnInit {
  public folder!: string;
  public diasDaSemana: DiaSemana[] = [];

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') || '';
    this.gerarSemanaAtual();
  }

  gerarSemanaAtual() {
    const hoje = new Date();
    const diaSemanaAtual = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    // Encontrar a Segunda-feira da semana atual
    const segundaFeira = new Date(hoje);
    const distanciaParaSegunda = diaSemanaAtual === 0 ? -6 : 1 - diaSemanaAtual;
    segundaFeira.setDate(hoje.getDate() + distanciaParaSegunda);

    const nomesDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    this.diasDaSemana = [];

    // Gerar apenas de Segunda a Sexta (5 dias) conforme o teu protótipo
    for (let i = 0; i < 5; i++) {
      const dataDia = new Date(segundaFeira);
      dataDia.setDate(segundaFeira.getDate() + i);

      this.diasDaSemana.push({
        nome: nomesDias[i],
        numero: dataDia.getDate(),
        isHoje: this.isMesmoDia(hoje, dataDia),
        dataCompleta: dataDia
      });
    }
  }

  // Função auxiliar para comparar se duas datas calham no mesmo dia do ano
  private isMesmoDia(data1: Date, data2: Date): boolean {
    return data1.getDate() === data2.getDate() &&
           data1.getMonth() === data2.getMonth() &&
           data1.getFullYear() === data2.getFullYear();
  }
}
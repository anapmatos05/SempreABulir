import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface DiaSemana {
  nome: string;
  numero: number;
  isHoje: boolean;
  dataCompleta: Date;
  temPrazo: boolean; // Nova propriedade para marcar se este dia ganhou um prazo
  prazoTitulo?: string; // Título do prazo associado a este dia
  prazoHora?: string;
}

interface NovoPrazo {
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  disciplina: string;
  prioridade: string;
  notificacao: boolean;
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

  // Objeto que se liga diretamente aos campos do formulário HTML
  public formularioprazo: NovoPrazo = {
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    disciplina: '',
    prioridade: 'baixa',
    notificacao: false
  };

  // Lista global que vai guardar todos os prazos criados
  public listaDePrazos: NovoPrazo[] = [];

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') || '';
    this.gerarSemanaAtual();
  }

  gerarSemanaAtual() {
    const hoje = new Date();
    const diaSemanaAtual = hoje.getDay();
    
    const segundaFeira = new Date(hoje);
    const distanciaParaSegunda = diaSemanaAtual === 0 ? -6 : 1 - diaSemanaAtual;
    segundaFeira.setDate(hoje.getDate() + distanciaParaSegunda);

    const nomesDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    this.diasDaSemana = [];

    for (let i = 0; i < 5; i++) {
      const dataDia = new Date(segundaFeira);
      dataDia.setDate(segundaFeira.getDate() + i);

      this.diasDaSemana.push({
        nome: nomesDias[i],
        numero: dataDia.getDate(),
        isHoje: this.isMesmoDia(hoje, dataDia),
        dataCompleta: dataDia,
        temPrazo: false // Por padrão, começa limpo
      });
    }
  }

  // Função chamada pelo botão "Guardar Prazo"
  guardarNovoPrazo(modal: any) {
    if (!this.formularioprazo.titulo || !this.formularioprazo.data) {
      alert('Por favor, preencha os campos obrigatórios (*)');
      return;
    }

    // 1. Guarda na nossa lista geral (para uso futuro, estatísticas, etc.)
    this.listaDePrazos.push({ ...this.formularioprazo });

    // 2. Tenta encontrar se a data selecionada calha na semana exibida para pôr a bolinha vermelha
    const dataSelecionada = new Date(this.formularioprazo.data);
    
    for (let dia of this.diasDaSemana) {
      if (this.isMesmoDia(dataSelecionada, dia.dataCompleta)) {
        dia.temPrazo = true;
        dia.prazoTitulo = this.formularioprazo.titulo;
        dia.prazoHora = this.formularioprazo.hora;
      }
    }

    // 3. Limpa o formulário para a próxima utilização
    this.formularioprazo = {
      titulo: '',
      descricao: '',
      data: '',
      hora: '',
      disciplina: '',
      prioridade: 'baixa',
      notificacao: false
    };

    // 4. Fecha o modal de forma limpa
    modal.dismiss();
  }

  private isMesmoDia(data1: Date, data2: Date): boolean {
    return data1.getDate() === data2.getDate() &&
           data1.getMonth() === data2.getMonth() &&
           data1.getFullYear() === data2.getFullYear();
  }
}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface DiaSemana {
  nome: string;
  numero: number;
  isHoje: boolean;
  dataCompleta: Date;
  temPrazo: boolean;
  prazoTitulo?: string;
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

  // Verifica se um prazo já passou da data e hora atuais
  prazoJaExpirou(dataString: string, horaString: string): boolean {
    if (!dataString) return false;

    // Se o utilizador não definir hora, assume o final do dia (23:59)
    const horaPrazo = horaString || '23:59';
    const dataPrazo = new Date(`${dataString}T${horaPrazo}`);
    const agora = new Date();

    return dataPrazo < agora;
  }

  // Retorna a quantidade de prazos ativos (para atualizar os contadores do HTML)
  get prazosAtivosCount(): number {
    return this.listaDePrazos.filter(p => !this.prazoJaExpirou(p.data, p.hora)).length;
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

      // Procura se existe algum prazo ativo para este dia da semana
      const prazoDoDia = this.listaDePrazos.find(prazo => {
        const dataPrazo = new Date(prazo.data);
        return this.isMesmoDia(dataPrazo, dataDia) && !this.prazoJaExpirou(prazo.data, prazo.hora);
      });

      this.diasDaSemana.push({
        nome: nomesDias[i],
        numero: dataDia.getDate(),
        isHoje: this.isMesmoDia(hoje, dataDia),
        dataCompleta: dataDia,
        temPrazo: !!prazoDoDia,
        prazoTitulo: prazoDoDia ? prazoDoDia.titulo : undefined,
        prazoHora: prazoDoDia ? prazoDoDia.hora : undefined
      });
    }
  }

  // Função chamada pelo botão "Guardar Prazo"
  guardarNovoPrazo(modal: any) {
    if (!this.formularioprazo.titulo || !this.formularioprazo.data) {
      alert('Por favor, preencha os campos obrigatórios (*)');
      return;
    }

    // Impede a criação de prazos com datas passadas
    if (this.prazoJaExpirou(this.formularioprazo.data, this.formularioprazo.hora)) {
      alert('Não podes adicionar um prazo com uma data ou hora que já passou!');
      return;
    }

    // 1. Guarda na nossa lista geral
    this.listaDePrazos.push({ ...this.formularioprazo });

    // 2. Atualiza o calendário e recalcula os prazos visíveis
    this.gerarSemanaAtual();

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
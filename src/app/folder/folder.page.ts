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
  estado: 'Pendente' | 'Em Progresso' | 'Concluída'; // Novo campo de estado
}

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false
})
export class FolderPage implements OnInit {
  public folder!: string; // Vai ser 'calendario', 'tarefas', etc.
  public diasDaSemana: DiaSemana[] = [];

  // Variáveis para os filtros do ecrã de Tarefas
  public termoPesquisa: string = '';
  public disciplinaFiltro: string = 'todas';
  public abaAtiva: string = 'Todas';

  // Objeto que se liga diretamente aos campos do formulário HTML
  public formularioprazo: NovoPrazo = {
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    disciplina: '',
    prioridade: 'baixa',
    notificacao: false,
    estado: 'Pendente'
  };

  // Lista global de prazos (Adicionei dados fictícios idênticos ao teu print para testes)
  public listaDePrazos: NovoPrazo[] = [
    {
      titulo: 'Relatório SO - Gestão de Memória',
      descricao: 'Escrever relatório sobre algoritmos de gestão de memória em sistemas operativos',
      data: '2026-05-21', // Adaptado para testes futuros próximos
      hora: '23:00',
      disciplina: 'SO',
      prioridade: 'alta',
      notificacao: false,
      estado: 'Em Progresso'
    },
    {
      titulo: 'Trabalho REDSIS - Protocolo TCP/IP',
      descricao: 'Análise detalhada do protocolo TCP/IP e implementação de exemplo',
      data: '2026-05-22',
      hora: '18:00',
      disciplina: 'REDSIS',
      prioridade: 'alta',
      notificacao: false,
      estado: 'Pendente'
    },
    {
      titulo: 'Apresentação INTHOM - Projeto Final',
      descricao: 'Apresentação do projeto de análise de tarefas e modelo conceptual',
      data: '2026-05-23',
      hora: '18:00',
      disciplina: 'IHM',
      prioridade: 'alta',
      notificacao: false,
      estado: 'Em Progresso'
    }
  ];

  constructor(private activatedRoute: ActivatedRoute) { }

 ngOnInit() {
    // Subscreve às mudanças de rota e converte o ID sempre para minúsculas
    this.activatedRoute.paramMap.subscribe(params => {
      const idRota = params.get('id') || 'calendario';
      this.folder = idRota.toLowerCase(); // Garante que 'Tarefas' passa a 'tarefas'
      
      if (this.folder === 'calendario') {
        this.gerarSemanaAtual();
      }
    });
  }

  prazoJaExpirou(dataString: string, horaString: string): boolean {
    if (!dataString) return false;
    const horaPrazo = horaString || '23:59';
    const dataPrazo = new Date(`${dataString}T${horaPrazo}`);
    const agora = new Date();
    return dataPrazo < agora;
  }

  get prazosAtivosCount(): number {
    return this.listaDePrazos.filter(p => !this.prazoJaExpirou(p.data, p.hora) && p.estado !== 'Concluída').length;
  }

  // Lista de disciplinas únicas para preencher o select de filtros dinamicamente
  get listaDisciplinasUnicas(): string[] {
    const disciplinas = this.listaDePrazos.map(p => p.disciplina).filter(d => !!d);
    return Array.from(new Set(disciplinas));
  }

  // Lógica de filtragem avançada para a lista de tarefas do ecrã
  get tarefasFiltradas(): NovoPrazo[] {
    return this.listaDePrazos.filter(tarefa => {
      // 1. Filtro por Termo de Pesquisa
      const correspondePesquisa = tarefa.titulo.toLowerCase().includes(this.termoPesquisa.toLowerCase()) || 
                                  tarefa.descricao.toLowerCase().includes(this.termoPesquisa.toLowerCase());
      
      // 2. Filtro por Disciplina Dropdown
      const correspondeDisciplina = this.disciplinaFiltro === 'todas' || tarefa.disciplina === this.disciplinaFiltro;
      
      // 3. Filtro pelas Abas (Todas, Pendentes, Em Progresso, Concluídas)
      let correspondeAba = true;
      if (this.abaAtiva === 'Pendentes') correspondeAba = tarefa.estado === 'Pendente';
      else if (this.abaAtiva === 'Em Progresso') correspondeAba = tarefa.estado === 'Em Progresso';
      else if (this.abaAtiva === 'Concluídas') correspondeAba = tarefa.estado === 'Concluída';

      return correspondePesquisa && correspondeDisciplina && correspondeAba;
    });
  }

  // Retorna a contagem exata para as labels das abas ex: "Pendentes (3)"
  contarPorEstado(estado: string): number {
    if (estado === 'Todas') return this.listaDePrazos.length;
    return this.listaDePrazos.filter(t => t.estado === estado).length;
  }

  // Calcula quantos dias faltam para a entrega de forma amigável
  obterDiasRestantesTexto(dataString: string): string {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const dataEntrega = new Date(dataString);
    dataEntrega.setHours(0,0,0,0);

    const diferencaTempo = dataEntrega.getTime() - hoje.getTime();
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

    if (diferencaDias === 0) return 'Hoje';
    if (diferencaDias === 1) return 'Amanhã';
    if (diferencaDias < 0) return 'Expirado';
    return `${diferencaDias} dias`;
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

      const prazoDoDia = this.listaDePrazos.find(prazo => {
        const dataPrazo = new Date(prazo.data);
        return this.isMesmoDia(dataPrazo, dataDia) && !this.prazoJaExpirou(prazo.data, prazo.hora) && prazo.estado !== 'Concluída';
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

  guardarNovoPrazo(modal: any) {
    if (!this.formularioprazo.titulo || !this.formularioprazo.data) {
      alert('Por favor, preencha os campos obrigatórios (*)');
      return;
    }

    this.listaDePrazos.push({ ...this.formularioprazo, estado: 'Pendente' });

    if (this.folder === 'calendario') {
      this.gerarSemanaAtual();
    }

    this.formularioprazo = {
      titulo: '',
      descricao: '',
      data: '',
      hora: '',
      disciplina: '',
      prioridade: 'baixa',
      notificacao: false,
      estado: 'Pendente'
    };

    modal.dismiss();
  }

  alterarEstadoTarefa(tarefa: NovoPrazo, novoEstado: 'Pendente' | 'Em Progresso' | 'Concluída') {
    tarefa.estado = novoEstado;
    if (this.folder === 'calendario') this.gerarSemanaAtual();
  }

  private isMesmoDia(data1: Date, data2: Date): boolean {
    return data1.getDate() === data2.getDate() &&
           data1.getMonth() === data2.getMonth() &&
           data1.getFullYear() === data2.getFullYear();
  }
}
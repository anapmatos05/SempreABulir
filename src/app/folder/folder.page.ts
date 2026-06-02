import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular'; // IMPORTAÇÃO DO STORAGE

// Interfaces base para não dar erros no TypeScript
export interface NovoPrazo {
  titulo: string;
  descricao: string;
  data: string;
  hora: string;
  disciplina: string;
  prioridade: string;
  notificacao: boolean;
  estado: 'Pendente' | 'Em Progresso' | 'Concluída';
}

export interface DiaSemana {
  nome: string;
  numero: number;
  isHoje: boolean;
  dataCompleta: Date;
  temPrazo: boolean;
  prazoTitulo?: string;
  prazoHora?: string;
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
    prioridade: 'media',
    notificacao: false,
    estado: 'Pendente'
  };

  // Lista global de prazos
  public listaDePrazos: NovoPrazo[] = [];

  // ==========================================
  // VARIÁVEIS DA ABA GRUPOS
  // ==========================================
  public listaGrupos: any[] = []; 
  public novoGrupo: any = { nome: '', disciplina: '', membros: ['Ana Matos'] };
  public novoMembroNome: string = '';

  // INJEÇÃO DO STORAGE NO CONSTRUTOR
  constructor(private activatedRoute: ActivatedRoute, private storage: Storage) { }

  async ngOnInit() {
    // 1. Inicializa a base de dados local
    await this.storage.create();
    
    // 2. Carrega os dados gravados anteriormente
    await this.carregarDadosDoStorage();

    // 3. Lógica de navegação existente
    this.activatedRoute.paramMap.subscribe(params => {
      const idRota = params.get('id') || 'calendario';
      this.folder = idRota.toLowerCase();
      
      if (this.folder === 'calendario') {
        this.gerarSemanaAtual();
      }
    });
  }

  // ==========================================
  // MÉTODOS DO STORAGE (LEITURA)
  // ==========================================
  async carregarDadosDoStorage() {
    const tarefasGuardadas = await this.storage.get('meus_prazos');
    if (tarefasGuardadas && tarefasGuardadas.length > 0) {
      this.listaDePrazos = tarefasGuardadas;
    } else {
      // Se estiver vazio, carrega os teus dados de demonstração
      this.listaDePrazos = [
        {
          titulo: 'Relatório SO - Gestão de Memória',
          descricao: 'Escrever relatório sobre algoritmos de gestão de memória em sistemas operativos',
          data: '2026-05-21',
          hora: '23:00',
          disciplina: 'Sistemas Operativos',
          prioridade: 'alta',
          notificacao: false,
          estado: 'Em Progresso'
        },
        {
          titulo: 'Trabalho REDSIS - Protocolo TCP/IP',
          descricao: 'Análise detalhada do protocolo TCP/IP e implementação de exemplo',
          data: '2026-05-22',
          hora: '18:00',
          disciplina: 'Redes de Computadores',
          prioridade: 'alta',
          notificacao: false,
          estado: 'Pendente'
        }
      ];
    }

    const gruposGuardados = await this.storage.get('meus_grupos');
    if (gruposGuardados) {
      this.listaGrupos = gruposGuardados;
    }
  }

  // ==========================================
  // MÉTODOS DOS GRUPOS
  // ==========================================
  adicionarMembroAoGrupo() {
    if (this.novoMembroNome.trim() !== '') {
      this.novoGrupo.membros.push(this.novoMembroNome.trim());
      this.novoMembroNome = '';
    }
  }

  removerMembroTemporario(index: number) {
    this.novoGrupo.membros.splice(index, 1);
  }

  guardarNovoGrupo(modal: any) {
    if (this.novoGrupo.nome.trim() !== '' && this.novoGrupo.disciplina.trim() !== '') {
      this.listaGrupos.push({
        nome: this.novoGrupo.nome,
        disciplina: this.novoGrupo.disciplina,
        membros: [...this.novoGrupo.membros],
        tarefas: []
      });

      // Grava no Storage
      this.storage.set('meus_grupos', this.listaGrupos);

      this.novoGrupo = { nome: '', disciplina: '', membros: ['Ana Matos'] };
      modal.dismiss();
    } else {
      alert('Por favor, preenche o Nome do Grupo e a Disciplina.');
    }
  }

  apagarGrupo(grupoParaApagar: any) {
    this.listaGrupos = this.listaGrupos.filter(g => g !== grupoParaApagar);
    this.storage.set('meus_grupos', this.listaGrupos); // Grava no Storage
  }

  obterIniciais(nome: string): string {
    let partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  // ==========================================
  // MÉTODOS DOS PRAZOS / CALENDÁRIO
  // ==========================================
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

  get listaDisciplinasUnicas(): string[] {
    return [
      'IHM (Interação Homem-Máquina)',
      'Programação Móvel',
      'Bases de Dados',
      'Engenharia de Software',
      'Sistemas Operativos',
      'Redes de Computadores',
      'Inteligência Artificial',
      'Matemática Computacional'
    ];
  }

  get tarefasFiltradas(): NovoPrazo[] {
    return this.listaDePrazos.filter(tarefa => {
      const correspondePesquisa = tarefa.titulo.toLowerCase().includes(this.termoPesquisa.toLowerCase()) || 
                                  tarefa.descricao.toLowerCase().includes(this.termoPesquisa.toLowerCase());
      
      const correspondeDisciplina = this.disciplinaFiltro === 'todas' || tarefa.disciplina === this.disciplinaFiltro;
      
      let correspondeAba = true;
      if (this.abaAtiva === 'Pendentes') correspondeAba = tarefa.estado === 'Pendente';
      else if (this.abaAtiva === 'Em Progresso') correspondeAba = tarefa.estado === 'Em Progresso';
      else if (this.abaAtiva === 'Concluídas') correspondeAba = tarefa.estado === 'Concluída';

      return correspondePesquisa && correspondeDisciplina && correspondeAba;
    });
  }

  contarPorEstado(estado: string): number {
    if (estado === 'Todas') return this.listaDePrazos.length;
    return this.listaDePrazos.filter(t => t.estado === estado).length;
  }

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
    if (!this.formularioprazo.titulo || !this.formularioprazo.data || !this.formularioprazo.disciplina) {
      alert('Por favor, preencha os campos obrigatórios (*)');
      return;
    }

    this.listaDePrazos.push({ ...this.formularioprazo, estado: 'Pendente' });
    
    // Grava a lista atualizada no Storage
    this.storage.set('meus_prazos', this.listaDePrazos);

    if (this.folder === 'calendario') {
      this.gerarSemanaAtual();
    }

    this.formularioprazo = {
      titulo: '',
      descricao: '',
      data: '',
      hora: '',
      disciplina: '',
      prioridade: 'media',
      notificacao: false,
      estado: 'Pendente'
    };

    modal.dismiss();
  }

  alterarEstadoTarefa(tarefa: NovoPrazo, novoEstado: 'Pendente' | 'Em Progresso' | 'Concluída') {
    tarefa.estado = novoEstado;
    
    // Grava a alteração de estado no Storage
    this.storage.set('meus_prazos', this.listaDePrazos);

    if (this.folder === 'calendario') this.gerarSemanaAtual();
  }

  private isMesmoDia(data1: Date, data2: Date): boolean {
    return data1.getDate() === data2.getDate() &&
           data1.getMonth() === data2.getMonth() &&
           data1.getFullYear() === data2.getFullYear();
  }
}
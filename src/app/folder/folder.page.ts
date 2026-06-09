import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { DataService, NovoPrazo } from '../services/data';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { GrupoService } from '../services/grupo';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false 
})
export class FolderPage implements OnInit {
  // Variáveis de controlo de navegação e interface
  public folder!: string;
  public abaAtiva: string = 'Todas';
  
  // Variáveis de calendário e seleção
  public dataSelecionadaCalendario: string = new Date().toISOString();
  public tarefaSelecionada: any = null;

  // Variáveis de filtragem
  public termoPesquisa: string = '';
  public disciplinaFiltro: string = 'todas';
  public filtroTempo: string = 'todas';

  // Formulário Reativo (Reactive Forms) para criação de tarefas
  public prazoForm: FormGroup;

  // Estrutura de dados temporária para criação de grupos
  public novoGrupo: any = { nome: '', disciplina: '', membros: ['Ana Matos'] };
  public novoMembroNome: string = '';
  
  // Variáveis de autenticação
  public userDisplayName: string = '';
  public userEmail: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private grupoService: GrupoService,
    private fb: FormBuilder,
    private navCtrl: NavController,
    private router: Router,
    private storage: Storage,
    private authService: AuthService
  ) {
    // Configuração do Formulário Reativo e respetivas validações
    this.prazoForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: [''],
      data: ['', Validators.required],
      hora: ['', Validators.required],
      disciplina: ['', Validators.required],
      prioridade: ['media'],
      notificacao: [false]
    });
  }

  ngOnInit() {
    // Subscrição dos parâmetros de rota para carregar a vista adequada
    this.activatedRoute.paramMap.subscribe(params => {
      const idRota = params.get('id') || 'calendario';
      this.folder = idRota.toLowerCase();
      this.gerarSemanaAtual();
    });

    // CORREÇÃO: Removeu-se o take(1) para permitir atualizações em tempo real assim que o Firebase carrega o user
    this.authService.currentUser$.pipe(
      filter(user => user !== null && user !== undefined)
    ).subscribe(user => {
      if (user?.displayName && user.displayName.trim() !== '') {
        this.userDisplayName = user.displayName;
      } else if (user?.email) {
        // Fallback: Se não houver displayName, usa a parte antes do '@' do email
        this.userDisplayName = user.email.split('@')[0];
      } else {
        this.userDisplayName = 'Utilizador';
      }

      if (user?.email) {
        this.userEmail = user.email;
      }
    });
  }

  // ==========================================
  // GESTÃO DE AUTENTICAÇÃO E PERFIL
  // ==========================================

  async fazerLogout() {
    try {
      await this.authService.logout();
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (error) {
      console.error('Erro ao efetuar logout na FolderPage:', error);
    }
  }

  openProfile() {
    this.navCtrl.navigateForward('/profile');
  }

  async copyEmail() {
    try {
      if (this.userEmail) {
        await navigator.clipboard.writeText(this.userEmail);
        console.log('Email copiado com sucesso:', this.userEmail);
      }
    } catch (e) {
      console.error('Erro ao copiar email:', e);
    }
  }

  // ==========================================
  // ACESSO AOS DADOS DO SERVIÇO
  // ==========================================
  
  get listaDePrazos(): NovoPrazo[] { return this.dataService.listaDePrazos; }
  get listaGrupos(): any[] { return this.dataService.listaGrupos; }
  get listaDisciplinasUnicas(): string[] { return this.dataService.listaDisciplinasJSON || []; }

  salvarDados() {
    this.storage.set('meus_prazos', this.dataService.listaDePrazos);
    this.storage.set('meus_grupos', this.dataService.listaGrupos);
  }

  // ==========================================
  // GESTÃO DE GRUPOS
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

  async guardarNovoGrupo(modal: any) {
    if (this.novoGrupo.nome.trim() === '' || this.novoGrupo.disciplina.trim() === '') {
      alert('Por favor, preencha o Nome do Grupo e a Disciplina.');
      return;
    }

    if (this.novoGrupo.membros.length === 0) {
      alert('O grupo não pode estar vazio. Adicione pelo menos um membro.');
      return;
    }

    // Prepara o pacote para a Nuvem
    const grupoParaGravar = {
      nome: this.novoGrupo.nome,
      disciplina: this.novoGrupo.disciplina,
      membros: [...this.novoGrupo.membros],
      progresso: 0,
      criadoEm: new Date().toISOString()
      // Removido o 'subtarefas: []' daqui porque no Firebase as subtarefas 
      // vão viver na sua própria subcoleção (como vimos no detalhe-grupo)
    };

    try {
      // Dispara para o Firebase!
      await this.grupoService.criarGrupo(grupoParaGravar);
      
      // Limpa o formulário e fecha o modal
      this.novoGrupo = { nome: '', disciplina: '', membros: ['Ana Matos'] };
      modal.dismiss();
    } catch (erro) {
      console.error('Erro ao criar grupo no Firebase:', erro);
      alert('Ocorreu um erro ao guardar o grupo na nuvem.');
    }
  }

  apagarGrupo(grupoParaApagar: any) {
    this.dataService.removerGrupo(grupoParaApagar);
    this.salvarDados();
  }

  obterIniciais(nome: string | any): string {
    const valor = typeof nome === 'string' ? nome : nome?.nome ?? '';
    const partes = valor.trim().split(' ');
    if (partes.length === 0 || partes[0] === '') return 'U';
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  obterNomeMembro(membro: any): string {
    return typeof membro === 'string' ? membro : membro?.nome ?? '';
  }

  obterListaNomesMembros(grupo: any): string {
    if (!grupo?.membros || grupo.membros.length === 0) {
      return 'Sem membros';
    }
    return grupo.membros.map((m: any) => this.obterNomeMembro(m)).join(', ');
  }

  abrirGrupo(grupo: any) {
    // O Firebase adiciona automaticamente um '.id' único a cada documento.
    // Usamos esse ID para abrir os detalhes certos. Se não existir (dados antigos locais), usa o nome.
    const identificador = grupo.id || grupo.nome; 
    this.router.navigate(['/detalhe-grupo', identificador]);
  }

  obterProgressoGrupo(grupo: any): number {
    const tarefas = grupo?.subtarefas ?? grupo?.tarefas ?? [];
    if (!grupo || tarefas.length === 0) {
      return 0;
    }
    const concluido = tarefas.filter((t: any) => t.concluida).length;
    return Math.round((concluido / tarefas.length) * 100);
  }

  obterTextoTarefasGrupo(grupo: any): string {
    const tarefas = grupo?.subtarefas ?? grupo?.tarefas ?? [];
    const total = tarefas.length;
    const concluido = tarefas.filter((t: any) => t.concluida).length;
    return `${concluido}/${total}`;
  }

  // ==========================================
  // PESQUISA DE MEMBROS (NOVO)
  // ==========================================
  public resultadosPesquisa: any[] = [];

  // Esta função corre sempre que escreves uma letra no input
  async pesquisarMembros() {
    const termo = this.novoMembroNome.trim();
    
    if (termo.length < 2) {
      // Se tiver menos de 2 letras, limpa a lista para não sobrecarregar a base de dados
      this.resultadosPesquisa = [];
      return;
    }

    try {
      this.resultadosPesquisa = await this.grupoService.procurarUtilizadores(termo);
      console.log("O Firebase encontrou:", this.resultadosPesquisa);
    } catch (erro) {
      console.error('Erro ao procurar utilizadores:', erro);
    }
  }

  // Esta função corre quando clicas no nome da pessoa na lista suspensa
  selecionarMembro(utilizadorEncontrado: any) {
    // Verifica se já está no grupo para não haver repetidos
    const jaExiste = this.novoGrupo.membros.find((m: any) => m.id === utilizadorEncontrado.id);
    
    if (!jaExiste) {
      // Guarda o objeto inteiro da pessoa (com ID e Email) em vez de apenas o nome!
      this.novoGrupo.membros.push({
        id: utilizadorEncontrado.id,
        nome: utilizadorEncontrado.nome,
        email: utilizadorEncontrado.email
      });
    }
    
    // Limpa a pesquisa
    this.novoMembroNome = '';
    this.resultadosPesquisa = [];
  }

  // ==========================================
  // GESTÃO DE TAREFAS E FILTRAGEM MULTICRITÉRIO
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

  get tarefasFiltradas(): NovoPrazo[] {
    return this.listaDePrazos.filter(tarefa => {
      const correspondePesquisa = tarefa.titulo.toLowerCase().includes(this.termoPesquisa.toLowerCase()) || 
                                  (tarefa.descricao && tarefa.descricao.toLowerCase().includes(this.termoPesquisa.toLowerCase()));
      
      const correspondeDisciplina = this.disciplinaFiltro === 'todas' || tarefa.disciplina === this.disciplinaFiltro;
      
      let correspondeAba = true;
      if (this.abaAtiva !== 'Todas') {
        correspondeAba = (this.abaAtiva === 'Pendentes' && tarefa.estado === 'Pendente') ||
                         (this.abaAtiva === 'Concluídas' && tarefa.estado === 'Concluída');
      }

      let correspondeTempo = true;
      if (this.filtroTempo !== 'todas') {
        const hoje = new Date();
        hoje.setHours(0,0,0,0);
        
        const dataPrazo = new Date(tarefa.data);
        dataPrazo.setHours(0,0,0,0);
        
        const diffDias = Math.ceil((dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

        if (this.filtroTempo === '24h') correspondeTempo = diffDias <= 1; 
        else if (this.filtroTempo === '3dias') correspondeTempo = diffDias <= 3;
        else if (this.filtroTempo === 'semana') correspondeTempo = diffDias <= 7;
        else if (this.filtroTempo === 'mes') correspondeTempo = diffDias <= 30;
      }

      return correspondePesquisa && correspondeDisciplina && correspondeAba && correspondeTempo;
    });
  }

  obterTarefasFiltradasPorEstado(estado: string): NovoPrazo[] {
    return this.tarefasFiltradas.filter(t => t.estado === estado);
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
    
    const diferencaDias = Math.ceil((dataEntrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diferencaDias === 0) return 'Hoje';
    if (diferencaDias === 1) return 'Amanhã';
    if (diferencaDias < 0) return 'Expirado';
    return `${diferencaDias} dias`;
  }

  obterDiasRestantesDias(dataString: string): number {
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const dataEntrega = new Date(dataString);
    dataEntrega.setHours(0,0,0,0);
    return Math.round((dataEntrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  obterEstiloPrazoTarefa(tarefa: any): { background: string; border: string; text: string; labelBg: string; labelColor: string; status: string } {
    if (tarefa.estado === 'Concluída') {
      return {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        text: '#64748b',
        labelBg: '#e2e8f0',
        labelColor: '#475569',
        status: 'Concluída'
      };
    }

    const dias = this.obterDiasRestantesDias(tarefa.data);
    if (dias < 0) {
      return {
        background: '#fff5f5',
        border: '1px solid #ffc9c9',
        text: '#b91c1c',
        labelBg: '#fee2e2',
        labelColor: '#991b1b',
        status: 'Atrasada'
      };
    }
    if (dias === 0) {
      return {
        background: '#fff5f5',
        border: '1px solid #fca5a5',
        text: '#b91c1c',
        labelBg: '#fecaca',
        labelColor: '#7f1d1d',
        status: 'Hoje'
      };
    }
    if (dias === 1) {
      return {
        background: '#fff7ed',
        border: '1px solid #fbcf89',
        text: '#9a3412',
        labelBg: '#fde68a',
        labelColor: '#92400e',
        status: 'Amanhã'
      };
    }
    return {
      background: '#ecfdf5',
      border: '1px solid #86efac',
      text: '#166534',
      labelBg: '#bbf7d0',
      labelColor: '#166534',
      status: `${dias} dias`
    };
  }

  obterCorBolaPrazo(tarefa: any): string {
    if (tarefa.estado === 'Concluída') {
      return '#b0b0b0';
    }
    const dias = this.obterDiasRestantesDias(tarefa.data);
    if (dias < 0 || dias === 0) {
      return '#b91c1c';
    }
    if (dias === 1) {
      return '#f59e0b';
    }
    return '#16a34a';
  }

  getDotColor(tarefa: any): string {
    if (!tarefa || tarefa.estado === 'Concluída') return '#b0b0b0';
    const dias = this.obterDiasRestantesDias(tarefa.data);
    if (dias < 0 || dias === 0) return '#b91c1c';
    if (dias === 1) return '#f59e0b';
    return '#16a34a';
  }

  guardarNovoPrazo(modal: any) {
    if (this.prazoForm.invalid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return; 
    }

    const novaTarefa: NovoPrazo = {
      titulo: this.prazoForm.value.titulo,
      descricao: this.prazoForm.value.descricao,
      data: this.prazoForm.value.data,
      hora: this.prazoForm.value.hora,
      disciplina: this.prazoForm.value.disciplina,
      prioridade: this.prazoForm.value.prioridade,
      notificacao: this.prazoForm.value.notificacao,
      estado: 'Pendente' 
    };

    this.dataService.adicionarTarefa(novaTarefa);
    this.salvarDados();

    this.prazoForm.reset({ prioridade: 'media', notificacao: false });
    if (this.folder === 'calendario') this.gerarSemanaAtual();
    
    modal.dismiss();
  }

  alterarEstadoTarefa(tarefa: NovoPrazo, novoEstado: 'Pendente' | 'Concluída') {
    tarefa.estado = novoEstado;
    this.dataService.atualizarEstadoTarefas();
    this.salvarDados(); 
    if (this.folder === 'calendario') this.gerarSemanaAtual();
  }

  abrirDetalhesTarefa(tarefa: any, modal: any) {
    this.tarefaSelecionada = tarefa;
    modal.present();
  }

  // ==========================================
  // LÓGICA DO CALENDÁRIO
  // ==========================================
  
  get tarefasDoDiaSelecionado(): any[] {
    if (!this.dataSelecionadaCalendario) return [];
    const dataLimpa = this.dataSelecionadaCalendario.split('T')[0];
    return this.listaDePrazos.filter(tarefa => tarefa.data === dataLimpa);
  }

  get diasComCores() {
    return this.listaDePrazos.map(tarefa => {
      return {
        date: tarefa.data,
        textColor: '#000000',
        backgroundColor: tarefa.estado === 'Concluída' ? '#bbf7d0' : '#fde047' 
      };
    });
  }

  get proximaTarefaAgendada(): any[] {
    const dataCalendario = this.dataSelecionadaCalendario.split('T')[0];
    const futuras = this.listaDePrazos.filter(t => t.estado !== 'Concluída' && t.data > dataCalendario);
    
    futuras.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    return futuras.length > 0 ? [futuras[0]] : [];
  }

  get diasDaSemana(): any[] {
    const hoje = new Date();
    const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dias = [];

    for (let i = 0; i < 4; i++) {
      const dataDia = new Date(hoje.getTime());
      dataDia.setDate(hoje.getDate() + i);

      const prazosDoDia = this.listaDePrazos.filter(prazo => {
        if (!prazo.data) return false;
        
        const partes = prazo.data.split('T')[0].split('-'); 
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; 
        const dia = parseInt(partes[2], 10);

        return ano === dataDia.getFullYear() &&
               mes === dataDia.getMonth() &&
               dia === dataDia.getDate() &&
               prazo.estado !== 'Concluída';
      });

      dias.push({
        nome: i === 0 ? 'Hoje' : (i === 1 ? 'Amanhã' : nomesDias[dataDia.getDay()]),
        numero: dataDia.getDate(),
        isHoje: i === 0,
        dataCompleta: dataDia,
        temPrazo: prazosDoDia.length > 0,
        tarefas: prazosDoDia
      });
    }
    return dias;
  }

  gerarSemanaAtual() {
    // Mantido para compatibilidade
  }

  private isMesmoDia(data1: Date, data2: Date): boolean {
    return data1.getDate() === data2.getDate() && 
           data1.getMonth() === data2.getMonth() && 
           data1.getFullYear() === data2.getFullYear();
  }
}
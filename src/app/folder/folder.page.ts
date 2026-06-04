import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { DataService, NovoPrazo } from '../services/data'; 

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private fb: FormBuilder,
    private navCtrl: NavController,
    private router: Router,
    private storage: Storage
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
  }

  // ==========================================
  // ACESSO AOS DADOS DO SERVIÇO
  // ==========================================
  
  get listaDePrazos(): NovoPrazo[] { return this.dataService.listaDePrazos; }
  get listaGrupos(): any[] { return this.dataService.listaGrupos; }
  get listaDisciplinasUnicas(): string[] { return this.dataService.listaDisciplinasJSON || []; }

  // Sincroniza o estado atual das listas com o armazenamento local do dispositivo
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

  guardarNovoGrupo(modal: any) {
    // Validação de preenchimento obrigatório
    if (this.novoGrupo.nome.trim() === '' || this.novoGrupo.disciplina.trim() === '') {
      alert('Por favor, preencha o Nome do Grupo e a Disciplina.');
      return;
    }

    // Validação de consistência do grupo
    if (this.novoGrupo.membros.length === 0) {
      alert('O grupo não pode estar vazio. Adicione pelo menos um membro.');
      return;
    }

    const grupoParaGravar = {
      nome: this.novoGrupo.nome,
      disciplina: this.novoGrupo.disciplina,
      membros: [...this.novoGrupo.membros],
      tarefas: [] 
    };

    this.dataService.adicionarGrupo(grupoParaGravar); 
    this.salvarDados(); 
    
    // Reposição do estado inicial para futuras criações
    this.novoGrupo = { nome: '', disciplina: '', membros: ['Ana Matos'] };
    modal.dismiss();
  }

  apagarGrupo(grupoParaApagar: any) {
    this.dataService.removerGrupo(grupoParaApagar);
    this.salvarDados();
  }

  obterIniciais(nome: string): string {
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  abrirGrupo(nomeDoGrupo: string) {
    // Navegação com passagem de parâmetros através do Angular Router
    this.router.navigate(['/detalhe-grupo', nomeDoGrupo]);
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

  // Motor de filtragem combinada: Pesquisa textual, Disciplina, Estado e Tempo
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
    
    // Extrai unicamente a data (YYYY-MM-DD) da string ISO
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
    
    const futuras = this.listaDePrazos.filter(t => 
      t.estado !== 'Concluída' && t.data > dataCalendario
    );
    
    // Ordenação cronológica ascendente
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
        
        // Desconstrução manual da data para prevenir discrepâncias de timezone
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
    // Método mantido para futura expansão da lógica de paginação semanal
  }

  private isMesmoDia(data1: Date, data2: Date): boolean {
    return data1.getDate() === data2.getDate() && 
           data1.getMonth() === data2.getMonth() && 
           data1.getFullYear() === data2.getFullYear();
  }
}
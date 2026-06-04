import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService, NovoPrazo, DiaSemana } from '../services/data'; // Ajusta o caminho se necessário
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  standalone: false // Mantemos a arquitetura clássica baseada em NgModules
})
export class FolderPage implements OnInit {
  public folder!: string;
  // 1. Variável para guardar o dia em que o utilizador clicou (começa no dia de hoje)
  public dataSelecionadaCalendario: string = new Date().toISOString();
  public tarefaSelecionada: any = null;

  // 2. Filtra as tarefas para mostrar apenas as do dia selecionado
  get tarefasDoDiaSelecionado(): any[] {
    if (!this.dataSelecionadaCalendario) return [];
    
    // O calendário devolve a data completa (ex: 2026-06-03T12:00:00)
    // Nós só queremos a parte do dia (2026-06-03) para comparar
    const dataLimpa = this.dataSelecionadaCalendario.split('T')[0];
    
    return this.listaDePrazos.filter(tarefa => tarefa.data === dataLimpa);
  }

  // 3. (BÓNUS) Cria as "bolinhas" de cor para pintar os dias no calendário!
  get diasComCores() {
    return this.listaDePrazos.map(tarefa => {
      return {
        date: tarefa.data,
        textColor: '#000000',
        // Verde se estiver concluída, amarelo se ainda estiver pendente
        backgroundColor: tarefa.estado === 'Concluída' ? '#bbf7d0' : '#fde047' 
      };
    });
  }

  // Variáveis para os filtros
  public termoPesquisa: string = '';
  public disciplinaFiltro: string = 'todas';
  public abaAtiva: string = 'Todas';
  public filtroTempo: string = 'todas';

  // Objeto do formulário
  public prazoForm: FormGroup;


  // Variáveis dos Grupos
  public novoGrupo: any = { nome: '', disciplina: '', membros: ['Ana Matos'] };
  public novoMembroNome: string = '';

  // INJETAMOS O NOVO SERVIÇO AQUI
  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private fb: FormBuilder,
    private navCtrl: NavController
  ) {
    // Inicializa o Formulário Reativo
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
    this.activatedRoute.paramMap.subscribe(params => {
      const idRota = params.get('id') || 'calendario';
      this.folder = idRota.toLowerCase();
      this.gerarSemanaAtual();
    });
  }

  // Lemos as listas diretamente do nosso DataService
  get listaDePrazos(): NovoPrazo[] { return this.dataService.listaDePrazos; }
  get listaGrupos(): any[] { return this.dataService.listaGrupos; }

  // ==========================================
  // LÓGICA DA INTERFACE: GRUPOS
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
    // 1. Verifica se os campos de texto estão preenchidos
    if (this.novoGrupo.nome.trim() === '' || this.novoGrupo.disciplina.trim() === '') {
      alert('Por favor, preenche o Nome do Grupo e a Disciplina.');
      return;
    }

    // 2. A NOVA VALIDAÇÃO: Verifica se o grupo tem pelo menos 1 membro
    if (this.novoGrupo.membros.length === 0) {
      alert('O grupo não pode estar vazio! Adiciona pelo menos a ti próprio.');
      return;
    }

    // Se passou nas duas validações, grava o grupo
    const grupoParaGravar = {
      nome: this.novoGrupo.nome,
      disciplina: this.novoGrupo.disciplina,
      membros: [...this.novoGrupo.membros],
      tarefas: [] // Começa sem tarefas
    };

    this.dataService.adicionarGrupo(grupoParaGravar); 
    
    // Limpa o formulário e repõe a "Ana Matos" por defeito para o próximo grupo!
    this.novoGrupo = { nome: '', disciplina: '', membros: ['Ana Matos'] };
    modal.dismiss();
  }

  apagarGrupo(grupoParaApagar: any) {
    this.dataService.removerGrupo(grupoParaApagar); // Delega para o Service
  }

  obterIniciais(nome: string): string {
    let partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  // ==========================================
  // LÓGICA DA INTERFACE: PRAZOS / CALENDÁRIO
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
    return this.dataService.listaDisciplinasJSON;
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

      // NOVO FILTRO DE TEMPO CORRIGIDO (Não apaga as tarefas concluídas!)
      let correspondeTempo = true;
      if (this.filtroTempo !== 'todas') {
        const hoje = new Date();
        hoje.setHours(0,0,0,0);
        const dataPrazo = new Date(tarefa.data);
        dataPrazo.setHours(0,0,0,0);
        // Calcula a diferença em dias matematicamente
        const diffDias = Math.ceil((dataPrazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

        // Mostra tarefas que estão dentro do prazo pedido (inclui as que estão em atraso)
        if (this.filtroTempo === '24h') {
          correspondeTempo = diffDias <= 1; 
        } else if (this.filtroTempo === '3dias') {
          correspondeTempo = diffDias <= 3;
        } else if (this.filtroTempo === 'semana') {
          correspondeTempo = diffDias <= 7;
        } else if (this.filtroTempo === 'mes') {
          correspondeTempo = diffDias <= 30;
        }
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

  gerarSemanaAtual() {
  }

  guardarNovoPrazo(modal: any) {
    if (this.prazoForm.invalid) {
      alert('Por favor, preenche todos os campos obrigatórios.');
      return; 
    }

    // Criamos o objeto completo conforme a interface NovoPrazo que o teu Service espera
    const novaTarefa: NovoPrazo = {
      titulo: this.prazoForm.value.titulo,
      descricao: this.prazoForm.value.descricao,
      data: this.prazoForm.value.data,
      hora: this.prazoForm.value.hora,
      disciplina: this.prazoForm.value.disciplina,
      prioridade: this.prazoForm.value.prioridade,
      notificacao: this.prazoForm.value.notificacao,
      estado: 'Pendente' // Estado inicial padrão
    };

    // Agora sim, enviamos para o teu Service!
    this.dataService.adicionarTarefa(novaTarefa); 

    // Limpa o formulário e fecha
    this.prazoForm.reset({ prioridade: 'media', notificacao: false });
    
    // Se estivermos no calendário, atualizamos a vista dos dias
    if (this.folder === 'calendario') this.gerarSemanaAtual();
    
    modal.dismiss();
  }

  alterarEstadoTarefa(tarefa: NovoPrazo, novoEstado: 'Pendente' | 'Concluída') {
    tarefa.estado = novoEstado;
    this.dataService.atualizarEstadoTarefas(); 
    if (this.folder === 'calendario') this.gerarSemanaAtual();
  }

  abrirDetalhesTarefa(tarefa: any, modal: any) {
    this.tarefaSelecionada = tarefa;
    modal.present();
  }

  abrirGrupo(nomeDoGrupo: string) {
    // Navega para os detalhes do grupo sem animação de deslize
    this.navCtrl.navigateForward(['/detalhe-grupo', nomeDoGrupo], { animated: false });
  }

  // Procura a próxima tarefa agendada a partir da data que está selecionada
  get proximaTarefaAgendada(): any[] {
    const dataCalendario = this.dataSelecionadaCalendario.split('T')[0];
    
    // Filtra tarefas ativas que têm data MAIOR que a data clicada no calendário
    const futuras = this.listaDePrazos.filter(t => 
      t.estado !== 'Concluída' && t.data > dataCalendario
    );
    
    // Ordena da mais próxima para a mais distante cronologicamente
    futuras.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    
    // Devolvemos apenas a primeira tarefa (a mais próxima) num array para o HTML ler facilmente
    return futuras.length > 0 ? [futuras[0]] : [];
  }

  get diasDaSemana(): any[] {
    const hoje = new Date();
    const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dias = [];

    for (let i = 0; i < 4; i++) {
      // Fazemos uma cópia do dia de hoje para não estragar a data original
      const dataDia = new Date(hoje.getTime());
      dataDia.setDate(hoje.getDate() + i);

      // Vamos à lista procurar as tarefas que combinam com este dia
      const prazosDoDia = this.listaDePrazos.filter(prazo => {
        if (!prazo.data) return false;
        
        // Separa a string "2026-06-05" em Ano=2026, Mês=6, Dia=5 (Isto torna as datas 100% à prova de erros e fusos horários!)
        const partes = prazo.data.split('T')[0].split('-'); 
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // O JavaScript conta os meses de 0 a 11
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

  private isMesmoDia(data1: Date, data2: Date): boolean {
    return data1.getDate() === data2.getDate() && data1.getMonth() === data2.getMonth() && data1.getFullYear() === data2.getFullYear();
  }
}
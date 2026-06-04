import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';

// As tuas interfaces passam a viver aqui para poderem ser usadas em toda a app
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
  dataCompleta?: Date;
  temPrazo: boolean;
  prazoTitulo?: string;
  prazoHora?: string;
  tarefas?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public listaDePrazos: NovoPrazo[] = [];
  public listaGrupos: any[] = [];
  private isPronto = false; 
  public listaDisciplinasJSON: string[] = [];

  // A MÁGICA ACONTECE AQUI: Pedimos o "Storage" dentro dos parênteses!
  constructor(private storage: Storage, private http: HttpClient) {
    this.carregarDisciplinasDoJSON(); // Carrega o JSON
    this.init(); // Arranca a Base de Dados (Storage) imediatamente!
  }

  // A função que vai à pasta assets ler o teu ficheiro
  // A versão Angular Oficial (que avisa o ecrã para se atualizar!)
  carregarDisciplinasDoJSON() {
    // Trocamos <string[]> por <any> para ele aceitar o objeto que vem do ficheiro
    this.http.get<any>('assets/disciplinas.json').subscribe({
      next: (dados) => {
        // Aqui dizemos para ele ir buscar a lista que está DENTRO da propriedade "disciplinas"
        this.listaDisciplinasJSON = dados.disciplinas; 
        
        console.log(' Disciplinas lidas com sucesso:', this.listaDisciplinasJSON);
      },
      error: (erro) => {
        console.error(' Erro a ler o JSON:', erro);
      }
    });
  }
  
  async init() {
    await this.storage.create();
    await this.carregarDadosDoStorage();
    this.isPronto = true;
  }

  // ==========================================
  // LÓGICA DO STORAGE (LEITURA E ESCRITA)
  // ==========================================
  private async carregarDadosDoStorage() {
    const tarefasGuardadas = await this.storage.get('meus_prazos');
    if (tarefasGuardadas && tarefasGuardadas.length > 0) {
      this.listaDePrazos = tarefasGuardadas;
    } else {
      // Dados de demonstração caso a base de dados esteja vazia
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
  // MÉTODOS PARA AS TAREFAS
  // ==========================================
  async adicionarPrazo(novoPrazo: NovoPrazo) {
    this.listaDePrazos.push({ ...novoPrazo, estado: 'Pendente' });
    await this.storage.set('meus_prazos', this.listaDePrazos);
  }

  async atualizarEstadoTarefas() {
    await this.storage.set('meus_prazos', this.listaDePrazos);
  }

  // ==========================================
  // MÉTODOS PARA OS GRUPOS
  // ==========================================
  async adicionarGrupo(grupo: any) {
    this.listaGrupos.push(grupo);
    await this.storage.set('meus_grupos', this.listaGrupos);
  }

  async removerGrupo(grupoParaApagar: any) {
    this.listaGrupos = this.listaGrupos.filter(g => g !== grupoParaApagar);
    await this.storage.set('meus_grupos', this.listaGrupos);
  }
  // Adiciona a nova tarefa à lista principal
  adicionarTarefa(novaTarefa: NovoPrazo) {
    this.listaDePrazos.push(novaTarefa);
  }
}

import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { 
  Firestore, collection, collectionData, doc, docData, 
  addDoc, query, where, getDocs, updateDoc, deleteDoc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private firestore: Firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  getDetalhesGrupo(grupoId: string): Observable<any> {
    return docData(doc(this.firestore, `grupos/${grupoId}`), { idField: 'id' });
  }

  getSubtarefas(grupoId: string): Observable<any[]> {
    return collectionData(
      collection(this.firestore, `grupos/${grupoId}/subtarefas`), 
      { idField: 'id' }
    );
  }

  getGruposAtivos(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'grupos'), { idField: 'id' });
  }

  async adicionarSubtarefa(grupoId: string, dadosTarefa: any) {
    return runInInjectionContext(this.injector, () => 
      addDoc(collection(this.firestore, `grupos/${grupoId}/subtarefas`), dadosTarefa)
    );
  }

  // 🚀 NOVO: Atualizar o estado de uma subtarefa (Visto / Não Visto)
  async atualizarSubtarefa(grupoId: string, tarefaId: string, dados: any): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      updateDoc(doc(this.firestore, `grupos/${grupoId}/subtarefas/${tarefaId}`), dados)
    );
  }

  async criarGrupo(grupoData: any): Promise<void> {
    await runInInjectionContext(this.injector, () => 
      addDoc(collection(this.firestore, 'grupos'), grupoData)
    );
  }

  // 🚀 NOVO: Atualizar um grupo (Nome, Membros, Chat, Ficheiros, Progresso)
  async atualizarGrupo(grupoId: string, dados: any): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      updateDoc(doc(this.firestore, `grupos/${grupoId}`), dados)
    );
  }

  // 🚀 NOVO: Apagar um grupo inteiro da nuvem
  async apagarGrupo(grupoId: string): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      deleteDoc(doc(this.firestore, `grupos/${grupoId}`))
    );
  }

  // 🚀 Pesquisa Estilo Outlook (Ignora maiúsculas/minúsculas e pesquisa por email também!)
  async procurarUtilizadores(termo: string): Promise<any[]> {
    return runInInjectionContext(this.injector, async () => {
      try {
        // 1. Vai buscar a lista de todos os utilizadores à base de dados
        const snapshot = await getDocs(collection(this.firestore, 'utilizadores'));
        const todosUtilizadores = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // 2. Limpa o que escreveste (passa tudo a minúsculas)
        const termoLimpo = termo.toLowerCase().trim();
        
        // 3. Filtra a lista inteligentemente!
        return todosUtilizadores.filter((u: any) => {
          const nome = (u.nome || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          
          // Se o nome OU o email contiverem as letras que escreveste, mostra a pessoa!
          return nome.includes(termoLimpo) || email.includes(termoLimpo);
        });
      } catch (erro) {
        console.error('Erro na pesquisa estilo Outlook:', erro);
        return [];
      }
    });
  }

  getGruposComSubtarefas(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'grupos'), { idField: 'id' }).pipe(
      switchMap((grupos: any[]) => {
        if (grupos.length === 0) return of([]);
        
        // Para cada grupo, vai buscar as suas subtarefas
        const grupos$ = grupos.map(grupo =>
          collectionData(
            collection(this.firestore, `grupos/${grupo.id}/subtarefas`),
            { idField: 'id' }
          ).pipe(
            map(subtarefas => ({ ...grupo, subtarefas }))
          )
        );
        
        return combineLatest(grupos$);
      })
    );
  }
}
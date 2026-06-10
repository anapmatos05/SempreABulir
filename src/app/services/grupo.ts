import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { 
  Firestore, collection, collectionData, doc, docData, 
  addDoc, getDocs, updateDoc, deleteDoc 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { Storage as FireStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private firestore: Firestore = inject(Firestore);
  private fireStorage: FireStorage = inject(FireStorage);
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

  getFicheiros(grupoId: string): Observable<any[]> {
    return collectionData(
      collection(this.firestore, `grupos/${grupoId}/ficheiros`),
      { idField: 'id' }
    );
  }

  getGruposAtivos(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'grupos'), { idField: 'id' });
  }

  getGruposComSubtarefas(): Observable<any[]> {
    return collectionData(collection(this.firestore, 'grupos'), { idField: 'id' }).pipe(
      switchMap((grupos: any[]) => {
        if (grupos.length === 0) return of([]);
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

  async adicionarSubtarefa(grupoId: string, dadosTarefa: any) {
    return runInInjectionContext(this.injector, () => 
      addDoc(collection(this.firestore, `grupos/${grupoId}/subtarefas`), dadosTarefa)
    );
  }

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

  async atualizarGrupo(grupoId: string, dados: any): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      updateDoc(doc(this.firestore, `grupos/${grupoId}`), dados)
    );
  }

  async apagarGrupo(grupoId: string): Promise<void> {
    return runInInjectionContext(this.injector, () => 
      deleteDoc(doc(this.firestore, `grupos/${grupoId}`))
    );
  }

  async uploadFicheiro(grupoId: string, file: File, autorNome: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const caminho = `grupos/${grupoId}/ficheiros/${Date.now()}_${file.name}`;
      const storageRef = ref(this.fireStorage, caminho);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(this.firestore, `grupos/${grupoId}/ficheiros`), {
        nome: file.name,
        url: url,
        tamanho: file.size,
        tipo: file.type,
        autor: autorNome,
        data: new Date().toISOString()
      });
    });
  }

  async removerFicheiro(grupoId: string, ficheiroId: string): Promise<void> {
    return runInInjectionContext(this.injector, () =>
      deleteDoc(doc(this.firestore, `grupos/${grupoId}/ficheiros/${ficheiroId}`))
    );
  }

  async procurarUtilizadores(termo: string): Promise<any[]> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const snapshot = await getDocs(collection(this.firestore, 'utilizadores'));
        const todosUtilizadores = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const termoLimpo = termo.toLowerCase().trim();
        return todosUtilizadores.filter((u: any) => {
          const nome = (u.nome || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          return nome.includes(termoLimpo) || email.includes(termoLimpo);
        });
      } catch (erro) {
        console.error('Erro na pesquisa estilo Outlook:', erro);
        return [];
      }
    });
  }
}
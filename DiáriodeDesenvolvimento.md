# Relatório de Trabalho Semanal - Agenda Académica (ESTG - IPVC)

Este documento mostra o que foi feito em cada sessão de trabalho, os problemas que apareceram, como os resolvemos e os commits associados.

---
As sessões 1 a 7 foram desenvolvidas pela Ana Matos.
##  Sessão 1 – Início do Projeto

###  Objetivo
Criar o projeto do zero e preparar o ambiente de trabalho.

###  O que foi feito
* **GitHub criado:** Criámos o repositório na internet para guardar o código do grupo.
* **Organização no computador:** Instalámos e abrimos a pasta do projeto no VS Code.
* **Criação do código base:** Criámos a base do projeto usando o Ionic e o Angular.
* **Testes no navegador:** Usámos o comando `ionic serve` para abrir o projeto no site e ver as alterações ao vivo.

###  Problemas Encontrados
* O comando `ionic serve` dava erro às vezes e não abria por causa de bloqueios no terminal do Windows e versões antigas do Node.js.

### Como foi resolvido
* Mudámos as permissões no terminal (PowerShell) e reinstalámos os programas que faltavam.

---

##  Sessão 2 – Estrutura de Serviços

###  Objetivo
Planear onde os dados iam ficar guardados e preparar as configurações.

###  O que foi feito
* **Desenho do projeto:** Planeámos como as páginas se iam ligar umas às outras.
* **Configurações:** Preparámos o ficheiro `package.json` com os pacotes que a aplicação ia precisar mais à frente.

---

## Sessão 3 – 14 de Maio de 2026

###  Objetivo
Começar a criar a lógica (Service) para mexer nos produtos.

###  O que foi feito
* **Criação do Service:** Criámos o ficheiro de serviço para controlar os produtos.
* **Guardar produtos:** Criámos a função para adicionar um novo produto.
* **Mudar produtos:** Criámos a função para atualizar as informações de um produto.

###  Problemas Encontrados
* Os dados dos produtos não mudavam quando tentávamos atualizar.

###  Como foi resolvido
* Corrigimos a forma como o produto estava montado antes de ser enviado para a base de dados.

###  Commits desta sessão:
* `feat(produtos): criar service para gestão de produtos`
* `feat(produtos): implementar método de inserção de produto`
* `feat(produtos): adicionar método para atualização de produto`
* `fix(produtos): corrigir composição do objeto enviado para atualização`

---

##  Sessão 4 – 20 de Maio de 2026

###  Objetivo
Fazer a página do calendário da aplicação e o formulário para adicionar prazos.

###  O que foi feito
* **Cores do grupo:** Criámos o ecrã inicial com as cores certas do nosso projeto.
* **Ecrã em pé:** Bloqueámos a aplicação para funcionar apenas com o telemóvel na vertical (enquanto em pé).
* **Menu e Cabeçalho:** Desenhámos o topo da página e alinhámos o menu de lado com o resto do ecrã.
* **Janela para adicionar:** Criámos uma janela flutuante (`ion-modal`) com um formulário para criar prazos.
* **Calendário inteligente:** Escrevemos o código no TypeScript para mostrar os dias da semana de forma automática, conforme o dia de hoje.
* **Bloqueio de erros:** Fizemos regras para o utilizador não conseguir guardar prazos errados ou impossíveis.

###  Problemas Encontrados
* Os números que contavam as tarefas não mudavam sozinhos e os prazos que já tinham passado continuavam a aparecer no calendário.

### Como foi resolvido
* Criámos um código que apaga os prazos velhos sozinho e atualiza os números no ecrã na hora.

###  Commits desta sessão:
* `feat(ui): customizar ecrã inicial com as cores do grupo`
* `feat(native): adicionar bloqueio para modo portrait (vertical)`
* `feat(layout): estruturar cabeçalho responsivo e menu lateral`
* `feat(prazos): criar ion-modal com formulário para novos prazos`
* `feat(calendario): desenvolver lógica para calendário semanal dinâmico`
* `fix(prazos): criar rotina para expiração automática e atualizar contadores`

---

##  Sessão 5 – 21 de Maio de 2026

###  Objetivo
Criar o ecrã de tarefas e deixar o visual igual ao desenho (protótipo) que tínhamos feito.

###  O que foi feito
* **Lista de tarefas:** Criámos o ecrã que mostra todas as tarefas do aluno.
* **Visual bonito:** Melhorámos a janela de prazos para ficar exatamente igual ao desenho planeado.
* **Lista de disciplinas:** Criámos uma lista com as disciplinas da escola para o utilizador escolher.

###  Problemas Encontrados
* Havia disciplinas repetidas a aparecer na lista por erro do código.
* A janela de novos prazos às vezes não abria quando estávamos no ecrã do calendário.

###  Como foi resolvido
* Limpámos a lista no TypeScript para apagar os nomes duplicados e corrigimos o botão do calendário para abrir sempre a janela.

###  Commits desta sessão:
* `feat(tarefas): implementar ecrã de listagem de tarefas`
* `style(prazos): refinar visual do modal de prazos conforme o protótipo`
* `feat(filtros): criar filtro de disciplinas para seleção no formulário`
* `fix(filtros): remover disciplinas duplicadas no array do TypeScript`
* `fix(calendario): corrigir referências de abertura do modal de prazos`

---

##  Sessão 6 – Semana de 2 a 9 de Junho de 2026

###  Objetivo
Melhorar os detalhes visuais e as cores da aplicação para ficar mais fácil de ler.

###  O que foi feito
* **Ajustes visuais:** Corrigimos pequenos erros de alinhamento em vários ecrãs.
* **Textos visíveis:** Mudámos a cor dos textos e botões para preto (`#000`) para que as pessoas consigam ler bem os nomes sobre o fundo branco.

###  Commits desta sessão:
* `style(ui): ajustar alinhamento de componentes em vários ecrãs`
* `style(acessibilidade): forçar cor preta (#000) nos rótulos e caixas de texto para melhorar o contraste`

---

##  Sessão 7 – 10 de Junho de 2026

###  Objetivo
Corrigir os botões do perfil (Popovers) que não abriam e resolver os problemas de ficheiros acumulados no GitHub (*Merge Conflicts*).

###  O que foi feito
* **Nova forma de abrir caixas:** Tirámos o sistema antigo de IDs nos botões do perfil e passámos a controlar a abertura diretamente pelo clique do botão.
* **Posição certa:** Usámos o comando `.present($event)` para que a caixinha do perfil saiba onde foi o clique e apareça no sítio certo do ecrã.
* **HTML arrumado:** Corrigimos códigos cortados e tags que estavam abertas por erro no formulário de prazos.
* **Limpeza no Git:** Corrigimos manualmente os 4 ficheiros que estavam com conflito no GitHub (`package.json`, `package-lock.json`, `app.component.ts` e `folder.page.html`) para conseguir juntar o código com a `main`.

###  Problemas Encontrados
* A caixinha do perfil não abria em alguns computadores ou telemóveis devido ao tamanho do ecrã.
* A página de perfil ficava presa a dizer `"Carregando..."` sem mostrar o nome do aluno.

### Como foi resolvido
* Controlámos a abertura pelo clique e passámos o `$event`. Para o erro do `"Carregando..."`, mudámos o código do `ngOnInit` para o `ionViewWillEnter`, que obriga o Ionic a ir buscar os dados do utilizador à base de dados sempre que a página aparece no ecrã.

###  Commits desta sessão:
* `fix(ui): alterar controlo dos popovers de perfil para acionamento via template reference`
* `fix(templates): fechar tags HTML órfãs no formulário do modal de prazos`
* `fix(conflitos): resolver conflitos de merge com a main no package e folder.page.html`
* `fix(perfil): mudar lógica para ionViewWillEnter para corrigir erro do "Carregando..."`

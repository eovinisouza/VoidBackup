# VoidBackup

## Descrição

VoidBackup é um plugin para Steam/Millennium destinado ao gerenciamento de backups de jogos diretamente pela interface da Steam. A aplicação adiciona uma interface gráfica integrada, permitindo ao usuário listar, restaurar e excluir backups de forma centralizada e segura.

A solução é composta por dois módulos distintos: um frontend executado no ambiente Chromium da Steam e um backend em Node.js responsável pelas operações de sistema.

---

## Funções Principais

* Injeção de interface gráfica na Steam por meio de JavaScript e DOM dinâmico
* Criação de botão flutuante para acesso rápido às funções de backup
* Exibição de modal para gerenciamento de backups
* Listagem de backups disponíveis via API local
* Restauração de backups com temporizador de segurança
* Exclusão de backups armazenados
* Reinicialização da Steam a partir da interface do plugin

---

## Frontend

O frontend é responsável pela interface visual e interação com o usuário.

Funções do frontend:

* Injetar estilos e componentes visuais dinamicamente
* Monitorar o carregamento da interface da Steam usando MutationObserver
* Criar e gerenciar elementos de UI como botões, modais e listas
* Enviar requisições HTTP ao backend para execução das ações

Observações:

* Executa exclusivamente em ambiente de navegador (Steam/Chromium)
* Não deve ser executado com Node.js

---

## Backend

O backend executa localmente em Node.js e fornece uma API HTTP para o frontend.

Funções do backend:

* Listar backups disponíveis
* Executar restauração de backups
* Excluir backups existentes
* Reiniciar o cliente Steam

---

## Comunicação

A comunicação entre frontend e backend ocorre via HTTP local, utilizando a Fetch API. O frontend depende da disponibilidade do backend para executar operações relacionadas ao sistema.

---

## Estrutura Geral

* Frontend: Interface gráfica e lógica de interação
* Backend: Operações de sistema e manipulação de arquivos

---

## Finalidade

O VoidBackup foi projetado para fornecer uma solução integrada, direta e funcional para o gerenciamento de backups de jogos dentro da Steam, mantendo separação clara entre interface e lógica de sistema.

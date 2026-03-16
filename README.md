# 🦉 Onde Parei - Gestor de Leituras Pessoais

## 1. Contexto Escolhido para o Projeto
O contexto escolhido para este projeto foi o desenvolvimento de um **Gestor de Biblioteca e Leituras Pessoais**. Muitos leitores têm dificuldade em lembrar em qual página pararam a leitura, quais livros estão na sua "lista de desejos" e quais já foram concluídos. O "Onde Parei" resolve esse problema oferecendo uma interface limpa onde o usuário pode buscar livros reais (via integração com o Google Books), adicioná-los à sua estante virtual, e gerenciar suas anotações, status (Lendo, Lido, Para ler) e página atual de forma intuitiva.

## 2. Arquitetura Adotada
O projeto adota uma arquitetura **Cliente-Servidor (Client-Server)** totalmente desacoplada, dividida em duas camadas principais:
* **Frontend (Cliente):** Desenvolvido como uma SPA (Single Page Application) utilizando **React.js** e Vite. Responsável por toda a interface gráfica, roteamento e consumo das APIs.
* **Backend (Servidor):** Construído com **Node.js** e **Express**. Atua como uma API RESTful, responsável pela regra de negócios, segurança (hash de senhas com bcrypt) e persistência dos dados.

## 3. Principais Decisões Técnicas
* **Bootstrap 5 para Estilização:** Escolhido pela facilidade na criação de interfaces responsivas e, principalmente, por fornecer suporte nativo a transições de *Dark Mode* e *Light Mode* através do atributo `data-bs-theme`, reduzindo a necessidade de CSS complexo.
* **Login Social (Google OAuth):** Implementado para melhorar a experiência do usuário (UX), permitindo um acesso rápido sem a necessidade de criar e lembrar de uma nova senha.
* **Persistência em Arquivos JSON:** Como estratégia para simplificar o ambiente de desenvolvimento e facilitar a execução do projeto em qualquer máquina, o banco de dados foi simulado utilizando o *File System* do Node (`fs`), lendo e escrevendo em arquivos `.json` ao invés de exigir a instalação de um SGBD pesado (como MySQL ou Postgres).
* **Componentização Modular:** O frontend foi estruturado separando Modais, Cartões (Cards) e o Cabeçalho (Header) em componentes independentes, facilitando a manutenção e a reutilização do código.

## 4. Instalação de Dependências e Execução
O projeto exige o **Node.js** instalado na máquina. Abra dois terminais diferentes para rodar as duas partes do projeto:

### ⚙️ Executando o Backend (Porta 5000)
1. Navegue até a pasta do servidor: `cd backend`
2. Instale as dependências: `npm install`
3. Inicie o servidor: `npm start`
* *O backend rodará em `http://localhost:5000`*

### 🎨 Executando o Frontend (Porta 5173)
1. Navegue até a pasta da interface: `cd frontend`
2. Instale as dependências: `npm install`
3. Inicie a aplicação: `npm start`
* *O frontend abrirá em `http://localhost:5173`*

## 5. Rotas do Frontend (React Router DOM)
O roteamento no frontend controla a navegação do usuário sem recarregar a página.
* `/` **(Bem-vindo):** Landing page de apresentação do sistema.
* `/login` **(Login):** Página para autenticação local ou via Google. Retém o ID do usuário no `localStorage` após o sucesso.
* `/cadastro` **(Cadastro):** Formulário de registro com validação de força de senha (Regex) e confirmação de senha.
* `/busca` **(Busca de Livros):** Página onde o usuário consome a API do Google Books para procurar novos títulos e salvá-los na sua conta.
* `/meus-livros` **(Biblioteca):** Painel principal de gestão (CRUD), listando os livros salvos pelo usuário, permitindo filtragem por status, edição do progresso (páginas/anotações) e remoção.

## 6. Rotas da API do Backend
As rotas seguem o padrão REST para comunicação HTTP.

**Usuários (`/usuarios`):**
* `POST /cadastrar`: Recebe os dados, criptografa a senha e registra um novo usuário local.
* `POST /login`: Valida as credenciais locais e retorna o ID de acesso.
* `POST /login_google`: Verifica se o e-mail do Google já existe; se sim, faz login. Se não, cadastra a nova conta atrelada ao Google.
* `GET /:id`: Busca e retorna os dados de perfil (nome, email) para renderizar no cabeçalho.
* `PATCH /atualizar_senha/:id`: Atualiza a senha do usuário de forma segura.
* `DELETE /deletar_conta/:id`: Remove o usuário e limpa sua respectiva biblioteca de livros.

**Livros (`/livros`):**
* `POST /cadastrar_livro`: Salva um novo livro associado ao ID do usuário ativo.
* `GET /listar_livros/:usuario_id`: Retorna o array de livros salvos apenas para aquele usuário específico.
* `PATCH /atualizar_livro/:id`: Atualiza campos específicos do livro (status, página atual e anotação).
* `DELETE /deletar_livro/:id`: Deleta um registro específico de livro.

## 7. Gerenciamento de Estado no Frontend
O fluxo de dados no React foi construído utilizando as seguintes estratégias:

* **`useState` (Estados Locais):** Utilizado massivamente para controlar a interatividade da tela. Ele guarda os valores digitados nos inputs (como `email` e `senha`), controla a abertura e fechamento das janelas (ex: `modalAtivo`), e armazena os arrays de dados (ex: `[livros, setLivros]`). Quando o `setState` é chamado, o React entende que houve uma mudança e re-renderiza apenas a parte da tela que foi afetada.
* **`useEffect` (Ciclo de Vida e Efeitos Colaterais):** Utilizado para executar ações em momentos específicos. Por exemplo:
    * No carregamento do `App.jsx`, um `useEffect` é disparado para ler o tema salvo (`dark`/`light`) no `localStorage` e aplicá-lo ao `document.documentElement`.
    * Nas páginas `/busca` e `/meus-livros`, o `useEffect` engatilha requisições GET pelo *Axios* assim que o componente é montado na tela, preenchendo as prateleiras virtuais com os dados vindos do banco.
* **Fluxo de Dados Unidirecional (Top-Down):** O sistema utiliza a técnica de passagem de propriedades (*Props*). Componentes "Pais" (como a página `MeusLivros`) guardam o estado e a lógica bruta, e passam esses dados e as funções (como a de alterar página) para baixo, para os "Filhos" (os componentes visuais, como o `CartaoMeusLivros` e o `ModalMeusLivros`), garantindo previsibilidade e evitando código duplicado.

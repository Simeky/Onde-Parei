# 📖 Onde Parei

> Um gerenciador de leituras simples e intuitivo para você nunca mais esquecer em qual página parou.

![Badge Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?style=for-the-badge&logo=bootstrap)
![Badge JS](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)

## 💻 Sobre o Projeto

**Onde Parei** é uma aplicação web Front-end desenvolvida para auxiliar leitores a organizar sua biblioteca pessoal. O objetivo principal é substituir os marcadores de página físicos e notas soltas, permitindo que o usuário registre o progresso de leitura, faça anotações e categorize seus livros.

O projeto foi construído com foco em **Front-end puro**, utilizando o `LocalStorage` do navegador para persistência de dados, simulando o comportamento de um banco de dados sem a necessidade de um Back-end.

## ⚙️ Funcionalidades

-   **Autenticação Simulada:** Sistema de Login e Cadastro (com validação de e-mail).
-   **Busca de Livros:** Integração com a **Google Books API** para pesquisar títulos, autores e capas.
-   **Minha Biblioteca:** Adição de livros a uma lista pessoal.
-   **Gestão de Progresso:**
    -   Atualização da página atual.
    -   Adição de notas e observações sobre a leitura.
    -   Alteração de status (*Para Ler, Lendo, Lido*).
-   **Filtros:** Organização visual dos livros por status.
-   **Temas:** Suporte nativo a **Dark Mode** e **Light Mode**.
-   **Responsividade:** Layout adaptável para dispositivos móveis e desktop usando Bootstrap 5.3.

---

## 🛠 Tecnologias Utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

-   **[HTML5](https://developer.mozilla.org/pt-BR/docs/Web/HTML)**: Estruturação semântica.
-   **[CSS3](https://developer.mozilla.org/pt-BR/docs/Web/CSS)**: Estilização personalizada.
-   **[JavaScript (Vanilla)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)**: Lógica de aplicação, manipulação do DOM e consumo de APIs.
-   **[Bootstrap 5.3](https://getbootstrap.com/)**: Framework para layout responsivo e componentes (Modais, Cards, Navbar).
-   **[API Ninjas (Email Validator)](https://api-ninjas.com/)**: Para validação real de endereços de e-mail no cadastro.
-   **[Google Books API](https://developers.google.com/books)**: Fonte de dados para busca de livros.

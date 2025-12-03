const API_NINJAS_KEY = 'qCe2H4YOn1LpGcK3uBd8Mw==DSDfKXW0uo5SWhzP';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    updateHeaderUser();
    
    const path = window.location.pathname;
    const isPublic = path.includes('index.html') || path.includes('login.html') || path.includes('cadastro.html') || path.includes('sobre.html') || path.includes('register.html');
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!isPublic && !user) {
        window.location.href = 'index.html';
    }
});

function applyTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
    const themeSwitch = document.getElementById('themeSwitch');
    if(themeSwitch) themeSwitch.checked = theme === 'dark';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
}


// --- AUTENTICAÇÃO E CADASTRO ---
async function registerUser() {
    const nome = document.getElementById('regNome').value;
    const email = document.getElementById('regEmail').value;
    const senha = document.getElementById('regSenha').value;
    const confSenha = document.getElementById('regConfSenha').value;

    if (senha !== confSenha) return alert('As senhas não coincidem!');

    // Validação de Email via API Ninjas
    try {
        const response = await fetch(`https://api.api-ninjas.com/v1/validateemail?email=${email}`, {
            headers: { 'X-Api-Key': API_NINJAS_KEY }
        });
        const data = await response.json();
        
        if (!data.is_valid) {
             alert('Email inválido segundo a API Ninjas (Verifique se inseriu a Key no script.js ou use um email real).');
             // return;
        }
    } catch (error) {
        console.warn('Erro na validação de email (provavelmente sem chave API), prosseguindo...');
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) return alert('Email já cadastrado!');

    users.push({ nome, email, senha, books: [] });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Cadastro realizado!');
    window.location.href = 'login.html';
}

function loginUser() {
    const loginInput = document.getElementById('loginUser').value; // Pode ser nome ou email
    const senhaInput = document.getElementById('loginSenha').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => (u.email === loginInput || u.nome === loginInput) && u.senha === senhaInput);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'home.html';
    } else {
        alert('Credenciais inválidas!');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function deleteAccount() {
    if(!confirm('Tem certeza? Essa ação é irreversível.')) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.email !== currentUser.email);
    
    localStorage.setItem('users', JSON.stringify(users));
    logout();
}

// --- CONFIGURAÇÕES E MODAIS ---
function updateHeaderUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        const nameDisplay = document.getElementById('configUserName');
        const emailDisplay = document.getElementById('configUserEmail');
        if(nameDisplay) nameDisplay.innerText = `Nome: ${user.nome}`;
        if(emailDisplay) emailDisplay.innerText = `E-mail: ${user.email}`;
    }
}

function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// --- LIVROS E API GOOGLE ---
async function searchBooks() {
    const query = document.getElementById('searchQuery').value;
    if (!query) return;

    const container = document.getElementById('booksContainer');
    container.innerHTML = '<p class="text-center">Carregando...</p>';

    try {
        const res = await fetch(`${GOOGLE_BOOKS_API}?q=${query}&maxResults=10`);
        const data = await res.json();
        
        container.innerHTML = '';
        if (data.items) {
            data.items.forEach(item => {
                const book = {
                    id: item.id,
                    title: item.volumeInfo.title || 'Sem Título',
                    authors: item.volumeInfo.authors || ['Desconhecido'],
                    pages: item.volumeInfo.pageCount || 0,
                    img: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190?text=Sem+Capa',
                    year: item.volumeInfo.publishedDate || 'N/A',
                    category: item.volumeInfo.categories?.[0] || 'Geral'
                };
                container.innerHTML += createBookCard(book, false);
            });
        } else {
            container.innerHTML = '<p class="text-center">Nenhum livro encontrado.</p>';
        }
    } catch (e) {
        container.innerHTML = '<p class="text-center text-danger">Erro ao buscar livros.</p>';
    }
}

function createBookCard(book, isMyBooks) {
    const bookJson = JSON.stringify(book).replace(/"/g, '&quot;');
    
    let actionBtn = `<button class="btn btn-primary w-100 mt-2" onclick="addToMyBooks(${bookJson})">Adicionar</button>`;
    let statusBadge = '';

    if (isMyBooks) {
        actionBtn = '';
        let badgeClass = 'bg-secondary';
        if(book.status === 'Lendo') badgeClass = 'bg-lendo';
        if(book.status === 'Para ler') badgeClass = 'bg-paraler';
        if(book.status === 'Lido') badgeClass = 'bg-lido';
        statusBadge = `<span class="status-tag ${badgeClass}">${book.status}</span>`;
    }

    return `
        <div class="col-md-3 mb-4">
            <div class="card book-card h-100 p-3" ${isMyBooks ? `onclick="openBookModal(${bookJson})"` : ''}>
                ${statusBadge}
                <img src="${book.img}" class="book-cover card-img-top w-100 rounded object-fit-cover" alt="${book.title}">
                <div class="card-body px-0 pb-0">
                    <h5 class="card-title text-truncate" title="${book.title}">${book.title}</h5>
                    <p class="card-text small mb-1">Autor: ${book.authors}</p>
                    <p class="card-text small mb-1">Ano: ${book.year} | Pág: ${book.pages}</p>
                    <p class="card-text small text-muted">${book.category}</p>
                    ${actionBtn}
                </div>
            </div>
        </div>
    `;
}

function addToMyBooks(book) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Atualiza o usuário atual
    if (!user.books) user.books = [];
    
    // Evita duplicatas
    if (user.books.find(b => b.id === book.id)) {
        return alert('Livro já está na sua lista!');
    }

    book.status = 'Para ler';
    book.currentPage = 0;
    book.notes = '';

    user.books.push(book);
    localStorage.setItem('currentUser', JSON.stringify(user));

    const userIndex = users.findIndex(u => u.email === user.email);
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Livro adicionado aos Meus Livros!');
}

// --- LÓGICA DA PÁGINA "MEUS LIVROS" ---
function loadMyBooks() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const filter = document.getElementById('statusFilter').value;
    const container = document.getElementById('myBooksContainer');
    
    if (!container) return; 

    container.innerHTML = '';
    
    if (!user.books || user.books.length === 0) {
        container.innerHTML = '<p class="text-center">Você ainda não adicionou livros.</p>';
        return;
    }

    user.books.forEach(book => {
        if (filter === 'Todos' || book.status === filter) {
            container.innerHTML += createBookCard(book, true);
        }
    });
}

// Modal de Detalhes do Livro
let currentEditingBookId = null;

function openBookModal(book) {
    currentEditingBookId = book.id;
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const storedBook = user.books.find(b => b.id === book.id);

    document.getElementById('modalBookTitle').innerText = storedBook.title;
    document.getElementById('modalBookCover').src = storedBook.img;
    document.getElementById('modalBookAuthor').innerText = storedBook.authors;
    document.getElementById('modalBookPages').innerText = storedBook.pages;
    
    document.getElementById('editStatus').value = storedBook.status;
    document.getElementById('editPage').value = storedBook.currentPage || 0;
    document.getElementById('editNotes').value = storedBook.notes || '';

    const modal = new bootstrap.Modal(document.getElementById('bookDetailModal'));
    modal.show();
}

function saveBookDetails() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    const bookIndex = user.books.findIndex(b => b.id === currentEditingBookId);
    if (bookIndex > -1) {
        user.books[bookIndex].status = document.getElementById('editStatus').value;
        user.books[bookIndex].currentPage = document.getElementById('editPage').value;
        user.books[bookIndex].notes = document.getElementById('editNotes').value;

        
        localStorage.setItem('currentUser', JSON.stringify(user));
        const dbIndex = users.findIndex(u => u.email === user.email);
        users[dbIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
        
        loadMyBooks();
        bootstrap.Modal.getInstance(document.getElementById('bookDetailModal')).hide();
    }
}
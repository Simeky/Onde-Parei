const API_NINJAS_KEY = 'qCe2H4YOn1LpGcK3uBd8Mw==DSDfKXW0uo5SWhzP';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const ITEMS_PER_PAGE = 8;
const GOOGLE_CLIENT_ID = "564328782086-14nq74v0b6fsvl4gi9senu50thflplv5.apps.googleusercontent.com"; 

let currentSearchQuery = '';
let currentSearchIndex = 0; 
let currentMyBooksPage = 1; 

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    updateHeaderUser();
    
    const path = window.location.pathname.toLowerCase();
    const isPublic = path.includes('index.html') || path.includes('login.html') || path.includes('cadastro.html') || path.includes('sobre.html');
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (!isPublic && !user) {
        window.location.href = 'index.html';
    }

    if (document.getElementById('myBooksContainer')) {
        loadMyBooks();
    }

    const btnPass = document.getElementById('changePassConfirm');
    if (btnPass) btnPass.addEventListener('click', changePassword);
});

window.onload = function() {
    const btnDiv = document.getElementById("buttonDiv");
    
    if (btnDiv && typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            btnDiv,
            { theme: "outline", size: "large", width: "100%", text: "signup_with" } 
        );
        // google.accounts.id.prompt(); // Pop-up automático
    } else if (btnDiv && typeof google === 'undefined') {
        console.error("O script do Google não carregou a tempo ou foi bloqueado.");
    }
};

function handleCredentialResponse(response) {
    const data = decodeJwtResponse(response.credential);

    const googleUser = {
        nome: data.name,
        email: data.email,
        foto: data.picture,
        senha: "", 
        books: [],
        isGoogle: true
    };

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(u => u.email === googleUser.email);

    if (!existingUser) {
        users.push(googleUser);
        localStorage.setItem('users', JSON.stringify(users));
    } else {
        googleUser.books = existingUser.books;
    }

    localStorage.setItem('currentUser', JSON.stringify(googleUser));
    window.location.href = 'home.html';
}

function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

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

async function registerUser() {
    const nome = document.getElementById('regNome').value;
    const email = document.getElementById('regEmail').value;
    const senha = document.getElementById('regSenha').value;
    const confSenha = document.getElementById('regConfSenha').value;

    if (senha !== confSenha) return alert('As senhas não coincidem!');

    try {
        const response = await fetch(`https://api.api-ninjas.com/v1/validateemail?email=${email}`, {
            headers: { 'X-Api-Key': API_NINJAS_KEY }
        });
        const data = await response.json();
    } catch (error) {
        console.warn('Erro API Ninjas, prosseguindo...');
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) return alert('Email já cadastrado!');

    users.push({ nome, email, senha, books: [] });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Cadastro realizado!');
    window.location.href = 'login.html';
}

function loginUser() {
    const loginInput = document.getElementById('loginUser').value;
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

function updateHeaderUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        const nameDisplay = document.getElementById('configUserName');
        const emailDisplay = document.getElementById('configUserEmail');
        if(nameDisplay) nameDisplay.innerText = `Nome: ${user.nome}`;
        if(emailDisplay) emailDisplay.innerText = `E-mail: ${user.email}`;

        // Esconde botão de senha se for Google
        const btnChangePass = document.querySelector('[data-bs-target="#changePassModal"]');
        if (btnChangePass) {
            btnChangePass.style.display = user.isGoogle ? 'none' : 'block';
        }
    }
}

function togglePassword(fieldId) {
    const input = document.getElementById(fieldId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function initSearch() {
    const query = document.getElementById('searchQuery').value;
    if (!query) return;
    currentSearchQuery = query;
    currentSearchIndex = 0;
    searchBooks();
}

async function searchBooks() {
    const container = document.getElementById('booksContainer');
    const paginationDiv = document.getElementById('paginationSearch');
    
    container.innerHTML = '<p class="text-center">Carregando...</p>';
    paginationDiv.innerHTML = '';

    try {
        const res = await fetch(`${GOOGLE_BOOKS_API}?q=${currentSearchQuery}&startIndex=${currentSearchIndex}&maxResults=${ITEMS_PER_PAGE}`);
        const data = await res.json();
        
        container.innerHTML = '';

        if (data.items) {
            data.items.forEach(item => {
                const book = formatGoogleBook(item);
                container.innerHTML += createBookCard(book, false);
            });
            renderSearchPagination(data.totalItems);
        } else {
            container.innerHTML = '<p class="text-center">Nenhum livro encontrado.</p>';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-center text-danger">Erro ao buscar livros.</p>';
    }
}

function formatGoogleBook(item) {
    let imgLink = item.volumeInfo.imageLinks?.thumbnail || 
                  item.volumeInfo.imageLinks?.smallThumbnail || 
                  'https://via.placeholder.com/128x190?text=Sem+Capa';

    if (imgLink) {
        imgLink = imgLink.replace('http://', 'https://');
        imgLink = imgLink.replace('&zoom=1', '&zoom=0'); 
        imgLink = imgLink.replace('&edge=curl', ''); 
    }

    return {
        id: item.id,
        title: item.volumeInfo.title || 'Sem Título',
        authors: item.volumeInfo.authors || ['Desconhecido'],
        pages: item.volumeInfo.pageCount || 0,
        img: imgLink,
        year: item.volumeInfo.publishedDate || 'N/A',
        category: item.volumeInfo.categories?.[0] || 'Geral'
    };
}

function renderSearchPagination() {
    const paginationDiv = document.getElementById('paginationSearch');
    const currentPage = (currentSearchIndex / ITEMS_PER_PAGE) + 1;
    const prevDisabled = currentSearchIndex === 0 ? 'disabled' : '';
    
    let html = `
        <nav aria-label="Navegação de busca">
            <ul class="pagination justify-content-center">
                <li class="page-item ${prevDisabled}">
                    <button class="page-link" onclick="changeSearchPage(-1)">Anterior</button>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${currentPage}</span>
                </li>
                <li class="page-item">
                    <button class="page-link" onclick="changeSearchPage(1)">Próxima</button>
                </li>
            </ul>
        </nav>
    `;
    paginationDiv.innerHTML = html;
}

function changeSearchPage(direction) {
    if (direction === 1) {
        currentSearchIndex += ITEMS_PER_PAGE;
    } else if (direction === -1 && currentSearchIndex >= ITEMS_PER_PAGE) {
        currentSearchIndex -= ITEMS_PER_PAGE;
    }
    searchBooks();
}

function loadMyBooks() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const filter = document.getElementById('statusFilter').value;
    const container = document.getElementById('myBooksContainer');
    const paginationDiv = document.getElementById('paginationMyBooks');
    
    if (!container) return; 

    container.innerHTML = '';
    
    if (!user.books || user.books.length === 0) {
        container.innerHTML = '<p class="text-center">Você ainda não adicionou livros.</p>';
        if(paginationDiv) paginationDiv.innerHTML = '';
        return;
    }

    let filteredBooks = user.books.filter(book => {
        return filter === 'Todos' || book.status === filter;
    });

    const totalBooks = filteredBooks.length;
    const totalPages = Math.ceil(totalBooks / ITEMS_PER_PAGE);

    if (currentMyBooksPage > totalPages && totalPages > 0) currentMyBooksPage = totalPages;
    if (totalPages === 0) currentMyBooksPage = 1;

    const start = (currentMyBooksPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const booksToShow = filteredBooks.slice(start, end);

    if (booksToShow.length > 0) {
        booksToShow.forEach(book => {
            container.innerHTML += createBookCard(book, true);
        });
        renderMyBooksPagination(totalPages);
    } else {
        container.innerHTML = '<p class="text-center">Nenhum livro encontrado com este filtro.</p>';
        if(paginationDiv) paginationDiv.innerHTML = '';
    }
}

function renderMyBooksPagination(totalPages) {
    const paginationDiv = document.getElementById('paginationMyBooks');
    if (!paginationDiv) return;

    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    const prevDisabled = currentMyBooksPage === 1 ? 'disabled' : '';
    const nextDisabled = currentMyBooksPage === totalPages ? 'disabled' : '';

    let html = `
        <nav aria-label="Navegação meus livros">
            <ul class="pagination justify-content-center">
                <li class="page-item ${prevDisabled}">
                    <button class="page-link" onclick="changeMyBooksPage(-1)">Anterior</button>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">Página ${currentMyBooksPage} de ${totalPages}</span>
                </li>
                <li class="page-item ${nextDisabled}">
                    <button class="page-link" onclick="changeMyBooksPage(1)">Próxima</button>
                </li>
            </ul>
        </nav>
    `;
    paginationDiv.innerHTML = html;
}

function changeMyBooksPage(direction) {
    currentMyBooksPage += direction;
    loadMyBooks();
    const mainContent = document.querySelector('.main-content');
    if(mainContent) mainContent.scrollIntoView({ behavior: 'smooth' });
}

function createBookCard(book, isMyBooks) {
    const bookJson = JSON.stringify(book).replace(/"/g, '&quot;');
    let highResImg = book.img;
    
    if (highResImg && !highResImg.includes('via.placeholder.com')) {
        highResImg = highResImg.replace('http://', 'https://');
        highResImg = highResImg.replace('&zoom=1', '&zoom=0'); 
        highResImg = highResImg.replace('&edge=curl', ''); 
    }

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
                <img src="${highResImg}" class="book-cover card-img-top" alt="${book.title}">
                
                <div class="card-body px-0 pb-0 d-flex flex-column">
                    <h5 class="card-title text-truncate" title="${book.title}">${book.title}</h5>
                    <p class="card-text small mb-1 text-truncate">Autor: ${book.authors}</p>
                    <div class="mt-auto">
                        <p class="card-text small mb-1">Ano: ${book.year} | Pág: ${book.pages}</p>
                        <p class="card-text small text-muted text-truncate">${book.category}</p>
                        ${actionBtn}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function addToMyBooks(book) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    if (!user.books) user.books = [];
    
    if (user.books.find(b => b.id === book.id)) {
        return alert('Livro já está na sua lista!');
    }

    book.status = 'Para ler';
    book.currentPage = 0;
    book.notes = '';
    user.books.push(book);
    
    saveUser(user, users);
    alert('Livro adicionado aos Meus Livros!');
}

let currentEditingBookId = null;

function openBookModal(book) {
    currentEditingBookId = book.id;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const storedBook = user.books.find(b => b.id === book.id);

    document.getElementById('modalBookTitle').innerText = storedBook.title;
    
    let modalImg = storedBook.img;
    
    if (modalImg && !modalImg.includes('via.placeholder.com')) {
        modalImg = modalImg.replace('http://', 'https://');
        modalImg = modalImg.replace('&zoom=1', '&zoom=0');
        modalImg = modalImg.replace('&edge=curl', '');
    }
    
    document.getElementById('modalBookCover').src = modalImg;
    document.getElementById('modalBookAuthor').innerText = storedBook.authors;
    document.getElementById('modalBookPages').innerText = storedBook.pages;     
    document.getElementById('editStatus').value = storedBook.status;
    document.getElementById('editPage').value = storedBook.currentPage || 0;
    document.getElementById('editNotes').value = storedBook.notes || '';

    const editPageInput = document.getElementById('editPage');
    editPageInput.max = storedBook.pages || 0;

    new bootstrap.Modal(document.getElementById('bookDetailModal')).show();
}

function saveBookDetails() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    const bookIndex = user.books.findIndex(b => b.id === currentEditingBookId);

    if (bookIndex > -1) {
        const editPageInput = document.getElementById('editPage');
        const val = parseInt(editPageInput.value) || 0;
        const max = parseInt(editPageInput.max) || 0;

        if (val < 0) return alert('Página inválida!');
        if (max > 0 && val > max) return alert(`A página não pode ser maior que ${max}!`);
        
        user.books[bookIndex].status = document.getElementById('editStatus').value;
        user.books[bookIndex].currentPage = val;
        user.books[bookIndex].notes = document.getElementById('editNotes').value;

        saveUser(user, users);
        loadMyBooks();
        bootstrap.Modal.getInstance(document.getElementById('bookDetailModal')).hide();
    }
}

function removeBookFromMyBooks() {
    if(!confirm('Remover este livro?')) return;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    
    user.books = user.books.filter(b => b.id !== currentEditingBookId);
    saveUser(user, users);
    
    loadMyBooks();
    bootstrap.Modal.getInstance(document.getElementById('bookDetailModal')).hide();
}

function saveUser(user, users) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    const idx = users.findIndex(u => u.email === user.email);
    if(idx > -1) users[idx] = user;
    localStorage.setItem('users', JSON.stringify(users));
}

function changePassword() {
    const newPass = document.getElementById('newPass').value;
    const conf = document.getElementById('confirmPass').value;
    if(!newPass || newPass !== conf) return alert('Verifique as senhas.');

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users'));
    user.senha = newPass;
    saveUser(user, users);
    
    alert('Senha alterada!');
    bootstrap.Modal.getInstance(document.getElementById('changePassModal')).hide();
}
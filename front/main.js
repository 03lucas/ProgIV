let usuarioLogado = false;
let pagina = 'movies';
let movies;
let movieSelecionado;

const githubSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.374 0 0 5.373 0 12C0 17.302 3.438 21.8 8.207 23.387C8.806 23.498 9 23.126 9 22.81V20.576C5.662 21.302 4.967 19.16 4.967 19.16C4.421 17.773 3.634 17.404 3.634 17.404C2.545 16.659 3.717 16.675 3.717 16.675C4.922 16.759 5.556 17.912 5.556 17.912C6.626 19.746 8.363 19.216 9.048 18.909C9.155 18.134 9.466 17.604 9.81 17.305C7.145 17 4.343 15.971 4.343 11.374C4.343 10.063 4.812 8.993 5.579 8.153C5.455 7.85 5.044 6.629 5.696 4.977C5.696 4.977 6.704 4.655 8.997 6.207C9.954 5.941 10.98 5.808 12 5.803C13.02 5.808 14.047 5.941 15.006 6.207C17.297 4.655 18.303 4.977 18.303 4.977C18.956 6.63 18.545 7.851 18.421 8.153C19.191 8.993 19.656 10.064 19.656 11.374C19.656 15.983 16.849 16.998 14.177 17.295C14.607 17.667 15 18.397 15 19.517V22.81C15 23.129 15.192 23.504 15.801 23.386C20.566 21.797 24 17.3 24 12C24 5.373 18.627 0 12 0Z" fill="white"/></svg>`;

const uld = localStorage.getItem('usuarioLogado');
if (uld) {
    try {
        usuarioLogado = JSON.parse(uld);
    } catch (error) {
        localStorage.removeItem('usuarioLogado');
        usuarioLogado = false;
    }
}

// comunicação com a API
async function apiRequest(url, options = {}) {
    try {
        const defaultOptions = { credentials: 'include' };
        if (options.method === 'POST' || options.method === 'PUT') {
            defaultOptions.headers = { 'Content-Type': 'application/json' };
        }
        const response = await fetch(url, { ...defaultOptions, ...options });
        if (!response.ok) {
            if (response.status === 401) {
                usuarioLogado = false;
                localStorage.removeItem('usuarioLogado');
                pagina = 'login';
                setTimeout(renderiza, 100);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

async function apiGet(url) { return await apiRequest(url, { method: 'GET' }); }
async function apiPost(url, data) { return await apiRequest(url, { method: 'POST', body: JSON.stringify(data) }); }
async function apiPut(url, data) { return await apiRequest(url, { method: 'PUT', body: JSON.stringify(data) }); }

function validarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validarCamposObrigatorios(email, senha) {
    if (!email || !email.trim()) { alert('Por favor, informe o e-mail'); return false; }
    if (!senha || !senha.trim()) { alert('Por favor, informe a senha'); return false; }
    if (!validarEmail(email)) { alert('Por favor, informe um e-mail válido'); return false; }
    return true;
}

// autenticacao
async function fazerLogin(email, senha) {
    if (!validarCamposObrigatorios(email, senha)) return;
    try {
        const res = await apiPost('/login', { email, senha });
        const userData = await res.json();
        if (userData.user) {
            usuarioLogado = userData.user;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            pagina = 'movies'; // volta pra pagina filmes
            renderiza();
        } else {
            alert('Erro: Dados de login inválidos');
        }
    } catch (error) {
        alert('E-mail ou senha inválidos');
    }
}

async function fazerRegistro(email, senha) {
    if (!validarCamposObrigatorios(email, senha)) return;
    if (senha.length < 6) { alert('A senha deve ter pelo menos 6 caracteres'); return; }
    try {
        const res = await apiPost('/users', { email, senha });
        alert('Usuário criado com sucesso! Faça login para continuar.');
        pagina = 'login';
        renderiza();
    } catch (error) {
        try {
            const errorData = await error.response.json();
            if (errorData.error) {
                alert(errorData.error);
            } else {
                alert('Ocorreu um erro ao criar o usuário.');
            }
        } catch (e) {
            alert('Ocorreu um erro ao criar o usuário.');
        }
    }
}

async function fazerLogout() {
    try {
        await apiPost('/logout');
        usuarioLogado = false;
        localStorage.removeItem('usuarioLogado');
        pagina = 'movies';
        renderiza();
    } catch (error) {
        alert('Erro ao fazer logout: ' + error.message);
    }
}

// Data fetching
async function buscaMovies() {
    try {
        const res = await apiGet('/movies');
        movies = await res.json();
        renderiza();
    } catch (error) {
        // se o fetch falhar, informa uma lista vazia pra mostrar o placeholder
        movies = [];
        renderiza();
        console.error('Erro ao carregar filmes: ' + error.message);
    }
}

// avaliacao filmes
async function avaliarMovie(movieId, scoreValue) {
    const score = parseFloat(scoreValue);
    if (isNaN(score) || score < 1 || score > 5) {
        alert('Por favor, informe uma nota de 1 a 5');
        return;
    }
    try {
        const res = await apiPost('/scores', { movie_id: movieId, score_value: score });
        const updatedMovie = await res.json();
        if (movies) {
            const movieIndex = movies.findIndex(m => m.id == movieId);
            if (movieIndex !== -1) movies[movieIndex] = updatedMovie;
        }
        if (movieSelecionado && movieSelecionado.id == movieId) {
            movieSelecionado = updatedMovie;
        }
        alert('Avaliação enviada com sucesso!');
        pagina = 'movies';
        renderiza();
    } catch (error) {
        alert('Erro ao enviar avaliação. Tente novamente.');
    }
}

// renderizar interface
function renderizaNavbar() {
    let userActions;
    if (usuarioLogado) {
        userActions = div([
            span({style: 'margin-right: 15px;'}, `Olá, ${usuarioLogado.email}`),
            button({ className: 'logout-button', onclick: fazerLogout }, 'Sair')
        ]);
    } else {
        userActions = button({ className: 'logout-button', onclick: () => { pagina = 'login'; renderiza(); } }, 'Login');
    }

    return header([
        nav({ className: 'container' }, [
            div({ className: 'bmovie-nav-content', style: 'display: flex; justify-content: space-between; width: 100%;' }, [
                div({ style: 'display: flex; align-items: gap: 10px;' }, [
                    h1({ 
                        style: 'cursor: pointer; margin: 0;',
                        onclick: () => { pagina = 'movies'; renderiza(); }
                    }, 'Bmovie'),
                    a({ href: 'https://github.com/03lucas/ProgIV', target: '_blank', style: 'margin-left: 8px;' }, [
                        div({ className: 'bmovie-contact-container' }, [
                            span({ innerHTML: githubSVG })
                        ])
                    ])
                ]),
                userActions
            ])
        ])
    ]);
}

function renderizaMovieScore(movie) {
     return div({ className: 'bmovie-score-container' }, [
        p({ className: 'bmovie-score-value' }, movie.score > 0 ? movie.score.toFixed(1) : '-'),
        p({ className: 'bmovie-score-count' }, `${movie.count || 0} avaliações`)
    ]);
}

function renderizaListaMovies() {
    if (!movies) return p('Carregando...');

    // sem filmes = placeholder
    if (movies.length === 0) {
        return div({ className: 'bmovie-grid' }, [
            div({ className: 'bmovie-card' }, [
                img({
                    className: 'bmovie-movie-card-image',
                    src: 'https://placehold.co/600x400/e8e8e8/cccccc?text=?'
                }),
                div({ className: 'bmovie-card-bottom-container' }, [
                    h3('Nenhum filme encontrado'),
                    div({ className: 'bmovie-score-container' }, [
                        p({ className: 'bmovie-score-value' }, '-'),
                        p({ className: 'bmovie-score-count' }, '0 avaliações')
                    ]),
                    button({
                        className: 'btn bmovie-btn',
                        disabled: true,
                        style: 'background-color: #6c757d; cursor: not-allowed;'
                    }, 'Avaliar')
                ])
            ])
        ]);
    }

    // se nao, mostra os filmes
    return div({ className: 'bmovie-grid' }, [
        ...movies.map(movie => {
            return div({ className: 'bmovie-card' }, [
                img({
                    className: 'bmovie-movie-card-image',
                    src: movie.image || 'https://placehold.co/600x400/cccccc/ffffff?text=No+Image',
                    alt: movie.title
                }),
                div({ className: 'bmovie-card-bottom-container' }, [
                    h3(movie.title),
                    renderizaMovieScore(movie),
                    button({
                        className: 'btn bmovie-btn',
                        onclick: function () {
                            movieSelecionado = movie;
                            pagina = 'detalhesMovie';
                            renderiza();
                        }
                    }, 'Avaliar')
                ])
            ]);
        })
    ]);
}

function renderizaMovies() {
    // chama buscaMovies se ainda nao tiver filmes
    if (!movies) buscaMovies();
    
    return div([
        renderizaNavbar(),
        div({ className: 'container' }, [
            div({ className: 'bmovie-listing-container' }, [
                renderizaListaMovies()
            ])
        ])
    ]);
}

function renderizaDetalhesMovie() {
    if (!movieSelecionado) return p('Filme não encontrado');
    
    let ratingInput;
    return div([
        renderizaNavbar(),
        div({ className: 'bmovie-form-container' }, [
            img({ className: 'bmovie-movie-card-image', src: movieSelecionado.image, alt: movieSelecionado.title }),
            div({ className: 'bmovie-card-bottom-container' }, [
                h3(movieSelecionado.title),
                form({
                    className: 'bmovie-form',
                    onsubmit: (e) => { e.preventDefault(); }
                }, [
                    div({ className: 'form-group' }, [
                        label({ for: 'score' }, 'Informe sua avaliação'),
                        ratingInput = select({ className: 'form-control', id: 'score' }, [
                            option({ value: '1' }, '1'),
                            option({ value: '2' }, '2'),
                            option({ value: '3' }, '3'),
                            option({ value: '4' }, '4'),
                            option({ value: '5' }, '5')
                        ])
                    ]),
                    div({ className: 'bmovie-form-btn-container' }, [
                        button({
                            className: 'btn bmovie-btn',
                            onclick: function () {
                                if (usuarioLogado) {
                                    avaliarMovie(movieSelecionado.id, ratingInput.value);
                                } else {
                                    alert('Você precisa fazer login para avaliar.');
                                    pagina = 'login';
                                    renderiza();
                                }
                            }
                        }, 'Salvar'),
                        button({
                            className: 'btn bmovie-btn bmovie-btn-cancel',
                            onclick: function () {
                                pagina = 'movies';
                                renderiza();
                            }
                        }, 'Cancelar')
                    ])
                ])
            ])
        ])
    ]);
}

function renderizaLogin() {
    let txt1, txt2;
    return div([
        renderizaNavbar(),
        div({ className: 'bmovie-auth-container' }, [
            h2('Login'),
            form({ onsubmit: (e) => { e.preventDefault(); fazerLogin(txt1.value, txt2.value); } }, [
                div({ className: 'form-group' }, [
                    label({ for: 'email' }, 'E-mail'),
                    txt1 = input({ className: 'form-control', type: 'email', id: 'email' })
                ]),
                div({ className: 'form-group' }, [
                    label({ for: 'senha' }, 'Senha'),
                    txt2 = input({ className: 'form-control', type: 'password', id: 'senha' })
                ]),
                button({ className: 'btn bmovie-btn', type: 'submit' }, 'Entrar')
            ]),
            div({ className: 'auth-actions' }, [
                p('Não tem conta? ', button({ onclick: () => { pagina = 'registro'; renderiza(); } }, 'Crie uma!'))
            ])
        ])
    ]);
}

function renderizaRegistro() {
    let txt1, txt2;
    return div([
        renderizaNavbar(),
        div({ className: 'bmovie-auth-container' }, [
            h2('Criar Conta'),
            form({ onsubmit: (e) => { e.preventDefault(); fazerRegistro(txt1.value, txt2.value); } }, [
                div({ className: 'form-group' }, [
                    label({ for: 'email' }, 'E-mail'),
                    txt1 = input({ className: 'form-control', type: 'email', id: 'email' })
                ]),
                div({ className: 'form-group' }, [
                    label({ for: 'senha' }, 'Senha'),
                    txt2 = input({ className: 'form-control', type: 'password', id: 'senha' })
                ]),
                button({ className: 'btn bmovie-btn', type: 'submit' }, 'Registrar')
            ]),
            div({ className: 'auth-actions' }, [
                p('Já tem conta? ', button({ onclick: () => { pagina = 'login'; renderiza(); } }, 'Faça Login'))
            ])
        ])
    ]);
}

// seletor de pagina
function renderiza() {
    document.body.innerHTML = '';
    let pag;

    if (pagina === 'login') {
        pag = renderizaLogin();
    } else if (pagina === 'registro') {
        pag = renderizaRegistro();
    } else if (pagina === 'detalhesMovie') {
        pag = renderizaDetalhesMovie();
    } else {
        // pagina default
        pagina = 'movies';
        pag = renderizaMovies();
    }
   
    document.body.appendChild(pag);
}

renderiza();

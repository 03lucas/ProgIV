const { Movie } = require('../model/movie');
const { Users } = require('../model/users');
const { Score } = require('../model/score');

module.exports.rotas = function(app) {

    function verificaUsuarioLogado(req, res, next){
        if(!req.cookies.SESSION)
            return res.status(401).send('Não está logado');
    
        if(!app.session[req.cookies.SESSION])
            return res.status(401).send('Sessão inválida');
    
        next();
    }

    // Rotas de Filmes (Movies)
    app.get('/movies', async (req, res) => {
        try {
            const movies = await Movie.listar();
            res.json(movies);
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao listar os filmes.' });
        }
    });

    app.post('/movies', async (req, res) => {
        try {
            await Movie.criar({ 
                title: req.body.title, 
                image: req.body.image 
            });
            res.status(201).send();
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao criar o filme.' });
        }
    });

    app.get('/movies/:id', async (req, res) => {
        try {
            const movie = await Movie.buscarPorId(req.params.id);
            if (movie) {
                res.json(movie);
            } else {
                res.status(404).send({ error: 'Filme não encontrado.' });
            }
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao buscar o filme.' });
        }
    });

    app.put('/movies/:id', async (req, res) => {
        try {
            await Movie.atualizar(req.params.id, req.body);
            res.status(200).send();
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao atualizar o filme.' });
        }
    });

    app.delete('/movies/:id', async (req, res) => {
        try {
            await Movie.excluir(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao excluir o filme.' });
        }
    });


    // Rotas de Usuários (Users)
    app.get('/users', async (req, res) => {
        try {
            const users = await Users.listar();
            res.json(users.map(u => {
                delete u.senha;
                delete u.tempero;
                return u;
            }));
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao buscar os usuários.' });
        }
    });

    app.post('/users', async (req, res) => {
        try {
            if (!req.body.email || !req.body.senha) {
                return res.status(400).send({ error: 'Email e senha são obrigatórios.' });
            }
            const user = await Users.criar(req.body);
            // Ensure password and salt are not returned
            const safeUser = { id: user.id, email: user.email, dt_criacao: user.dt_criacao };
            res.status(201).json(safeUser);
        } catch (error) {
            // Check if it's a duplicate email error
            if (error.code === '23505' && error.constraint === 'users_email_key') {
                return res.status(400).send({ error: 'Este email já está em uso.' });
            }
            console.error('Error creating user:', error);
            res.status(500).send({ error: 'Ocorreu um erro ao criar o usuário.' });
        }
    });

    // Rota de Avaliações (Scores)
    app.post('/scores', verificaUsuarioLogado, async (req, res) => {
        try {
            const idSessao = req.cookies.SESSION;
            const usuarioLogado = app.session[idSessao];
            
            const { movie_id, score_value } = req.body;
            const user_id = usuarioLogado.id;

            let movie = await Movie.buscarPorId(movie_id);
            if (!movie) {
                return res.status(404).send({ error: 'Filme não encontrado.' });
            }

            const existingScore = await Score.buscarPorChaveComposta(movie_id, user_id);

            let old_score_value = 0;

            if (existingScore) {
                old_score_value = existingScore.score_value;
                await Score.atualizar(movie_id, user_id, { score_value });
            } else {
                await Score.criar({ movie_id, user_id, score_value });
                movie.count++;
            }

            const totalScore = movie.score * (existingScore ? movie.count : (movie.count - 1));
            const newTotalScore = totalScore - old_score_value + score_value;
            movie.score = newTotalScore / movie.count;
            movie.score = parseFloat(movie.score.toFixed(1));

            await Movie.atualizar(movie_id, {
                title: movie.title,
                score: movie.score,
                count: movie.count,
                image: movie.image,
            });

            res.status(201).send(movie);
        } catch (error) {
            console.error(error);
            res.status(500).send({ error: 'Ocorreu um erro ao salvar a avaliação.' });
        }
    });

    // Rotas de Autenticação
    app.post('/login', async (req, res) => {
        if(!req.body.email || !req.body.senha){
            return res.status(400).send("Email ou senha faltando.");
        }

        const users = await Users.listar({ email: req.body.email });
        if(users.length == 0){
            return res.status(400).send("Usuário ou senha inválidos.");
        }

        const user = users[0];
        const { hash } = await Users.criarHash(req.body.senha, user.tempero);

        if(hash !== user.senha){
            return res.status(400).send("Usuário ou senha inválidos.");
        }

        const idSessao = await Users.criaValorAleatorio(16);
        delete user.senha;
        delete user.tempero;
        app.session[idSessao] = user;

        res.cookie('SESSION', idSessao, {
            httpOnly: true,
            secure: true, 
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'Login bem-sucedido!', user });
    });

    app.post('/logout', verificaUsuarioLogado, async (req, res) => {
        delete app.session[req.cookies.SESSION];

        res.clearCookie('SESSION', {
            httpOnly: true,
            secure: true, 
            sameSite: 'strict'
        });
    
        res.status(204).end();
    });
};
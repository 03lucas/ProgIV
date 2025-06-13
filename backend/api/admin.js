const { Movie } = require('../model/movie');
const { Users } = require('../model/users');
const { Score } = require('../model/score');

module.exports.rotas = function(app) {

    // rotas movie
    app.get('/movies', async (req, res) => {
        try {
            const movies = await Movie.listar();
            res.json(movies);
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao buscar os filmes.' });
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

    app.post('/movies', async (req, res) => {
        try {
            await Movie.criar(req.body);
            res.status(201).send();
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao criar o filme.' });
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


    // rotas users
    app.get('/users', async (req, res) => {
        try {
            const users = await Users.listar();
            res.json(users);
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao buscar os usuários.' });
        }
    });

    app.post('/users', async (req, res) => {
        try {
            await Users.criar(req.body);
            res.status(201).send();
        } catch (error) {
            res.status(500).send({ error: 'Ocorreu um erro ao criar o usuário.' });
        }
    });

    // rotas score
    app.post('/scores', async (req, res) => {
        try {
            // criar ou atualiza pontuação
            // recalcula a pontuação do filme
            const { movie_id, user_id, score_value } = req.body;

            // busca o usuário ou cria um novo
            let user = await Users.buscarPorId(user_id);
            if (!user) {
                return res.status(404).send({ error: 'Usuário não encontrado.'});
            }

            // busca o filme
            let movie = await Movie.buscarPorId(movie_id);
            if (!movie) {
                return res.status(404).send({ error: 'Filme não encontrado.' });
            }

            // verifica se ja existe score para filme/usuário
            const existingScore = await Score.buscarPorChaveComposta(movie_id, user_id);

            let old_score_value = 0;

            if (existingScore) {
                // atualiza o score
                old_score_value = existingScore.score_value;
                await Score.atualizar(movie_id, user_id, { score_value });
            } else {
                // cria score
                await Score.criar({ movie_id, user_id, score_value });
                movie.count++; // Incrementa o contador de avaliações
            }

            // recalcula o score do filme
            const totalScore = movie.score * (existingScore ? movie.count : (movie.count - 1));
            const newTotalScore = totalScore - old_score_value + score_value;
            movie.score = newTotalScore / movie.count;
            movie.score = parseFloat(movie.score.toFixed(1));

            // atualiza os dados no bd
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

};
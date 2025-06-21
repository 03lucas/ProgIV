const db = require("../utils/database");

const Score = {

    async criar(dados){
        await db.query(`
            INSERT INTO score (movie_id, user_id, score_value) 
            VALUES ($1, $2, $3)
        `, [dados.movie_id, dados.user_id, dados.score_value]);
    },

    async atualizar(movie_id, user_id, dados){
        await db.query(`
            UPDATE score
            SET 
                score_value = $1
            WHERE 
                movie_id = $2 AND user_id = $3
        `, [dados.score_value, movie_id, user_id]);
    },

    async listar(){
        const lista = await db.query(`
            SELECT *
            FROM score
            ORDER BY movie_id, user_id
        `);
        return lista;
    },

    async buscarPorChaveComposta(movie_id, user_id){
        const score = await db.query(`
            SELECT *
            FROM score
            WHERE movie_id = $1 AND user_id = $2
        `, [movie_id, user_id]);
        return score.length > 0 ? score[0] : null;
    },

    async listarPorMovieId(movie_id){
        const lista = await db.query(`
            SELECT *
            FROM score
            WHERE movie_id = $1
            ORDER BY user_id
        `, [movie_id]);
        return lista;
    },

    async listarPorUserId(user_id){
        const lista = await db.query(`
            SELECT *
            FROM score
            WHERE user_id = $1
            ORDER BY movie_id
        `, [user_id]);
        return lista;
    },

    async excluir(movie_id, user_id){
        await db.query(`
            DELETE FROM score
            WHERE 
                movie_id = $1 AND user_id = $2
        `, [movie_id, user_id]);
    }

}

module.exports = {
    Score
}

const db = require("../util/database");

const Score = {

    async criar(dados){
        await db.query(`
            INSERT INTO score (movie_id, user_id, score_value) 
            VALUES (
                ${dados.movie_id},
                ${dados.user_id},
                ${dados.score_value}
            )
        `);
    },

    async atualizar(movie_id, user_id, dados){
        await db.query(`
            UPDATE score
            SET 
                score_value = ${dados.score_value}
            WHERE 
                movie_id = ${movie_id} AND user_id = ${user_id}
        `);
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
            WHERE movie_id = ${movie_id} AND user_id = ${user_id}
        `);
        return score.length > 0 ? score[0] : null;
    },

    async listarPorMovieId(movie_id){
        const lista = await db.query(`
            SELECT *
            FROM score
            WHERE movie_id = ${movie_id}
            ORDER BY user_id
        `);
        return lista;
    },

    async listarPorUserId(user_id){
        const lista = await db.query(`
            SELECT *
            FROM score
            WHERE user_id = ${user_id}
            ORDER BY movie_id
        `);
        return lista;
    },

    async excluir(movie_id, user_id){
        await db.query(`
            DELETE FROM score
            WHERE 
                movie_id = ${movie_id} AND user_id = ${user_id}
        `);
    }

}

module.exports = {
    Score
}

const db = require('../utils/database');

const Movie = {

    async criar(dados){
        await db.query(`
            INSERT INTO movie (count, score, image, title) 
            VALUES (0, 0, $1, $2)
        `, [dados.image, dados.title]);
    },

    async atualizar(id, dados){
        await db.query(`
            UPDATE movie
            SET 
                count = $1, 
                score = $2, 
                image = $3,
                title = $4
            WHERE 
                id = $5
        `, [dados.count, dados.score, dados.image, dados.title, id]);
    },

    async listar(){
        const lista = await db.query(`
            SELECT *
            FROM movie
            ORDER BY id
        `);
        return lista;
    },

    async buscarPorId(id){
        const movie = await db.query(`
            SELECT *
            FROM movie
            WHERE id = $1
        `, [id]);
        return movie.length > 0 ? movie[0] : null;
    },

    async excluir(id){
        await db.query(`
            DELETE FROM movie
            WHERE 
                id = $1
        `, [id]);
    }

}

module.exports = {
    Movie
}

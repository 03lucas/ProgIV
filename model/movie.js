const db = require('../util/database');

const Movie = {

    async criar(dados){
        await db.query(`
            INSERT INTO movie (count, score, image, title) 
            VALUES (
                ${dados.count},
                ${dados.score},
                '${dados.image}',
                '${dados.title}'
            )
        `);
    },

    async atualizar(id, dados){
        await db.query(`
            UPDATE movie
            SET 
                count = ${dados.count}, 
                score = ${dados.score}, 
                image = '${dados.image}',
                title = '${dados.title}'
            WHERE 
                id = ${id}
        `);
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
            WHERE id = ${id}
        `);
        return movie.length > 0 ? movie[0] : null;
    },

    async excluir(id){
        await db.query(`
            DELETE FROM movie
            WHERE 
                id = ${id}
        `);
    }

}

module.exports = {
    Movie
}

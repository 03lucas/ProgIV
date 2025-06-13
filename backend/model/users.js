const db = require("../utils/database");

const Users = {

    async criar(dados){
        await db.query(`
            INSERT INTO users (email) 
            VALUES (
                '${dados.email}'
            )
        `);
    },

    async atualizar(id, dados){
        await db.query(`
            UPDATE users
            SET 
                email = '${dados.email}'
            WHERE 
                id = ${id}
        `);
    },

    async listar(){
        const lista = await db.query(`
            SELECT *
            FROM users
            ORDER BY id
        `);
        return lista;
    },

    async buscarPorId(id){
        const user = await db.query(`
            SELECT *
            FROM users
            WHERE id = ${id}
        `);
        return user.length > 0 ? user[0] : null;
    },

    async excluir(id){
        await db.query(`
            DELETE FROM users
            WHERE 
                id = ${id}
        `);
    }

}

module.exports = {
    Users
}

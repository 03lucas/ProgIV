const db = require("../utils/database");
const { pbkdf2, randomBytes } = require('node:crypto');

const Users = {

    criarHash(senha, tempero) {
        return new Promise((resolve, reject) => {
            const doHash = (salt) => {
                pbkdf2(senha, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                    if (err) return reject(err);
                    resolve({
                        tempero: salt,
                        hash: derivedKey.toString('hex')
                    });
                });
            };

            if (tempero) {
                doHash(tempero);
            } else {
                randomBytes(8, (err, buf) => {
                    if (err) return reject(err);
                    doHash(buf.toString('hex'));
                });
            }
        });
    },

    criaValorAleatorio(tamanhoEmBytes) {
        return new Promise((resolve, reject) => {
            randomBytes(tamanhoEmBytes, (err, buf) => {
                if (err) return reject(err);
                resolve(buf.toString('hex'));
            });
        });
    },

    async criar(dados){
        const { hash, tempero } = await this.criarHash(dados.senha);
        const result = await db.query(`
            INSERT INTO users (email, senha, tempero) 
            VALUES ($1, $2, $3)
            RETURNING id, email, dt_criacao
        `, [dados.email, hash, tempero]);

        return result.length > 0 ? result[0] : null;
    },

    async atualizar(id, dados){
        await db.query(`
            UPDATE users
            SET 
                email = $1
            WHERE 
                id = $2
        `, [dados.email, id]);
    },

    async listar(filtros = {}){
        let sql = `SELECT * FROM users`;
        const values = [];
        const where = [];

        if (filtros.email) {
            values.push(filtros.email);
            where.push(`email = $${values.length}`);
        }
        
        if (where.length > 0) {
            sql += ' WHERE ' + where.join(' AND ');
        }
        sql += ` ORDER BY id`;
        
        const lista = await db.query(sql, values);
        return lista;
    },

    async buscarPorId(id){
        const user = await db.query(`
            SELECT id, email, dt_criacao
            FROM users
            WHERE id = $1
        `, [id]);
        return user.length > 0 ? user[0] : null;
    },

    async excluir(id){
        await db.query(`
            DELETE FROM users
            WHERE 
                id = $1
        `, [id]);
    }

}

module.exports = {
    Users
}

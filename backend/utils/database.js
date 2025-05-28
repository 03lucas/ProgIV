const {Pool} = require('pg');

const Database = {
    conectar(){
        globalThis.pool = new Pool ({
            host:'localhost',
            user:'postgres',
            port: '5432',
            max: 20,
            idleTimeoutMillis:30000,
            connectionTimeoutMillis: 2000
        });
    },

    async query(sql){
        const result = await globalThis.db.query(sql);
        return result.rows;
    }
}

module.exports = Database;
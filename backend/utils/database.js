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

    async query(sql, values = []){
        const client = await globalThis.pool.connect();
        try {
            const result = await client.query(sql, values);
            return result.rows;
        } finally {
            client.release();
        }
    }
}

module.exports = Database;
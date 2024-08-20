const mysql = require('mysql2');

class Database {
    constructor(config) {
        this.pool = mysql.createPool(config);
    }

    query(sql, params) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = Database;
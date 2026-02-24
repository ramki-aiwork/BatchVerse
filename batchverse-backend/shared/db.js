const mssql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // e.g., 'myserver.database.windows.net'
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: false // Change to true for local dev / self-signed certs
    }
};

let pool;

async function getPool() {
    if (pool) return pool;
    try {
        if (!process.env.DB_SERVER) {
            console.log('Using Mock DB Connection (Environment variables not set)');
            return null; // Return null to signal mock mode
        }
        pool = await mssql.connect(config);
        return pool;
    } catch (err) {
        console.error('Database Connection Failed! Make sure config is correct.', err);
        throw err;
    }
}

module.exports = {
    getPool,
    sql: mssql
};

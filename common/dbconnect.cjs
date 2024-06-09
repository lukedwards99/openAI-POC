// import { Pool } from "pg"
const { Pool } = require("pg")

// require('dotenv').config({
//     override: true,
//     path: path.join(__dirname, "development.env")
// });

const pool = new Pool({
    user: "postgres",
    host: "127.0.0.1",
    database: "postgres",
    password: "password",
    port: 5432
})

async function runQuery(query, params) {
    try {
        const response = await pool.query(query, params);
        const { rows } = response;
        return rows
    } catch (err) {
        console.log(err);
        return false
    }
}

module.exports = runQuery

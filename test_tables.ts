import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL as string);
    const [rows] = await conn.query('SHOW TABLES');
    console.log(rows);
    await conn.end();
}
check();

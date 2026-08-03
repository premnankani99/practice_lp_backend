import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function wipeDatabase() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(process.env.DATABASE_URL as string);
    
    console.log('Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('Fetching all tables...');
    const [rows] = await connection.query('SHOW TABLES');
    const tables = (rows as any[]).map(r => Object.values(r)[0]);
    
    if (tables.length === 0) {
        console.log('No tables found to drop.');
    } else {
        console.log(`Dropping ${tables.length} tables...`);
        for (const table of tables) {
            await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
            console.log(`Dropped table: ${table}`);
        }
    }
    
    console.log('Re-enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Database wiped successfully!');
    await connection.end();
}

wipeDatabase().catch(console.error);

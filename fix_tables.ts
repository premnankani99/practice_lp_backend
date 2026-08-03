import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function fixTableNames() {
    console.log('Connecting to database...');
    const conn = await mysql.createConnection(process.env.DATABASE_URL as string);
    
    try {
        console.log('Renaming _employeemanagers to _EmployeeManagers...');
        await conn.query('RENAME TABLE `_employeemanagers` TO `_EmployeeManagers`');
        console.log('Success!');
    } catch(e) {
        console.log('Already renamed or error:', (e as Error).message);
    }

    try {
        console.log('Renaming compoffgrant to CompOffGrant...');
        await conn.query('RENAME TABLE `compoffgrant` TO `CompOffGrant`');
        console.log('Success!');
    } catch(e) {
        console.log('Already renamed or error:', (e as Error).message);
    }
    
    await conn.end();
}
fixTableNames();

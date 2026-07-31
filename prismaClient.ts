import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL || '';
const connectionString = url.startsWith('mysql://') ? url.replace('mysql://', 'mariadb://') : url;

const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

export default prisma;

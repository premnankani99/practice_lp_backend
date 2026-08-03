import { getPendingVerifications } from './controllers/admin';
import { Request, Response } from 'express';

const req = {} as Request;
const res = {
    status: (code: number) => ({
        json: (data: any) => console.log('Status:', code, 'Data:', data)
    })
} as Response;

getPendingVerifications(req, res).catch(console.error);

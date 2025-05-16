import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Método no permitido' });

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autenticado' });

    try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        const formularios = await prisma.formulario.findMany({ where: { userId } });
        res.status(200).json(formularios);
    } catch (error) {
        res.status(401).json({ message: 'Token inválido', error });
    }
}

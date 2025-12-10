import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, baseId: user.baseId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role, baseId: user.baseId } });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    // Only Admin should theoretically register users, or basic setup.
    // For demo, public register? Or Admin only?
    // Let's allow public for setup or seed.
    try {
        const { username, password, role, baseId } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'LOGISTICS_OFFICER',
                baseId: baseId ? Number(baseId) : null
            }
        });

        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

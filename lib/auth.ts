import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};

export const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
        return null;
    }
};

export const getUserFromRequest = (req: Request) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    return verifyToken(token);
};

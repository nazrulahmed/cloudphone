import jwt from 'jsonwebtoken';

export const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.user = decoded; // Contains userId, tenantId, email, role
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

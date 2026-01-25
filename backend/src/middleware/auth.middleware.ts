import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { JWTPayload, AuthenticatedRequest } from '../types/index.js';

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
        req.user = decoded; // { id, role, type }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const authorize = (roles: string[] = []) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (roles.length && !roles.includes(req.user.role || '')) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
    };
};

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && (req.user as any).type !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    next();
};

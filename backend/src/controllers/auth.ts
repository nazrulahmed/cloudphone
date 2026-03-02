import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: any, res: any) => {
    const { company, email, password } = req.body;

    try {
        // Start transaction
        await query('BEGIN');

        // 1. Create Tenant
        const tenantResult = await query(
            'INSERT INTO tenants (company, country) VALUES ($1, $2) RETURNING id',
            [company, 'UK'] // Defaulting to UK as per prototype
        );
        const tenantId = tenantResult.rows[0].id;

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create User
        const userResult = await query(
            'INSERT INTO users (tenant_id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, role',
            [tenantId, email, passwordHash]
        );
        const user = userResult.rows[0];

        await query('COMMIT');

        // 4. Generate Token
        const token = jwt.sign(
            { userId: user.id, tenantId, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: {
                email: user.email,
                role: user.role,
            }
        });
    } catch (error: any) {
        await query('ROLLBACK');
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message || 'Error creating account' });
    }
};

export const login = async (req: any, res: any) => {
    const { email, password } = req.body;

    try {
        const result = await query(
            'SELECT u.*, t.company FROM users u JOIN tenants t ON u.tenant_id = t.id WHERE u.email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, tenantId: user.tenant_id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                email: user.email,
                role: user.role,
            },
            tenant: {
                company: user.company
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

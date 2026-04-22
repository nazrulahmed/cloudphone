import { query } from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
        }
    }
});
export const uploadKycDocument = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 1; // Fallback for testing
        const documentType = req.body.documentType;
        if (!req.file) {
            return res.status(400).json({ error: 'No document file provided.' });
        }
        if (!documentType) {
            return res.status(400).json({ error: 'documentType is required.' });
        }
        // Relative path to serve to frontend
        const filePath = `/uploads/${req.file.filename}`;
        const result = await query('INSERT INTO kyc_documents (tenant_id, document_type, file_path, status) VALUES ($1, $2, $3, $4) RETURNING *', [tenantId, documentType, filePath, 'pending']);
        res.status(201).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        console.error('Error uploading KYC document:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
export const getKycDocuments = async (req, res) => {
    try {
        const tenantId = req.user?.tenantId || 1; // Fallback to 1 for testing
        const result = await query('SELECT * FROM kyc_documents WHERE tenant_id = $1 ORDER BY uploaded_at DESC', [tenantId]);
        res.json({ success: true, data: result.rows });
    }
    catch (error) {
        console.error('Error fetching KYC documents:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
//# sourceMappingURL=onboarding.js.map
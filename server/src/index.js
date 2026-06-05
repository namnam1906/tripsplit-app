import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateSettlement } from './services/settlement.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));

// ── API routes ────────────────────────────────────────────────────────────────

app.get('/health', (_, res) => res.json({ ok: true, service: 'tripsplit-server' }));

app.post('/api/trips', async (req, res) => {
  const { tripName, members = [] } = req.body;
  res.json({
    tripId: `trip_${Date.now()}`,
    tripName,
    members,
    driveFolderStatus: 'TODO_CONNECT_GOOGLE_DRIVE',
    sheetStatus: 'TODO_CONNECT_GOOGLE_SHEET'
  });
});

app.post('/api/expenses/settlement', (req, res) => {
  const { members = [], expenses = [] } = req.body;
  res.json({ settlements: calculateSettlement(members, expenses) });
});

app.post('/api/receipts/ocr', upload.single('receipt'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'receipt file is required' });
  res.json({
    status: 'OCR_STUB',
    filename: req.file.originalname,
    draftExpense: {
      title: 'รายการจากใบเสร็จ OCR',
      category: 'อาหาร',
      amount: 0,
      paidBy: '',
      splitWith: []
    }
  });
});

// ── Serve React client build ──────────────────────────────────────────────────

const clientBuild = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuild));

// SPA fallback — Express v5 requires named wildcard, not bare *
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

app.listen(PORT, () => console.log(`TripSplit server running on ${PORT}`));

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { calculateSettlement } from './services/settlement.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_, res) => res.json({ ok: true, service: 'tripsplit-server' }));

app.post('/api/trips', async (req, res) => {
  const { tripName, members = [] } = req.body;
  // TODO: create Google Drive folder + Google Sheet via n8n/Google API
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
  // TODO: send image to Akson OCR or n8n webhook, then normalize result to expense draft
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

app.listen(PORT, () => console.log(`TripSplit server running on ${PORT}`));

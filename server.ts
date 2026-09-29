import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { compilePrompts, executeTestDrive } from './src/engine/compiler';
import { PRESET_SCENARIOS } from './src/data/presets';
import { PromptSlot, CompressionMode } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    engine: 'PromptOptimizer Multi-Platform Compiler v1.0',
    timestamp: new Date().toISOString(),
    supportedPlatforms: ['chatgpt', 'claude', 'gemini', 'cursor', 'deepseek', 'custom'],
    compressionModes: [
      'production_balanced',
      'ultra_distilled',
      'structured_xml',
      'target_gemini',
      'target_claude',
      'target_chatgpt',
      'target_cursor',
      'target_deepseek'
    ]
  });
});

// Presets API
app.get('/api/presets', (_req: Request, res: Response) => {
  res.json({ presets: PRESET_SCENARIOS });
});

// Analyze & Compile API
app.post('/api/analyze-and-compile', (req: Request, res: Response) => {
  try {
    const { slots, mode } = req.body as { slots: PromptSlot[]; mode?: CompressionMode };
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Missing or invalid "slots" array in request body.' });
    }

    const synthesis = compilePrompts(slots, mode || 'production_balanced');
    return res.json(synthesis);
  } catch (error: any) {
    console.error('Compilation error:', error);
    return res.status(500).json({ error: error?.message || 'Internal synthesis failure' });
  }
});

// Test Drive API
app.post('/api/test-drive', (req: Request, res: Response) => {
  try {
    const { masterPrompt, testPayload, mode } = req.body as {
      masterPrompt: string;
      testPayload: string;
      mode?: CompressionMode;
    };

    if (!masterPrompt) {
      return res.status(400).json({ error: 'Missing "masterPrompt" string in request body.' });
    }

    const result = executeTestDrive(masterPrompt, testPayload || '', mode || 'production_balanced');
    return res.json(result);
  } catch (error: any) {
    console.error('Test drive execution error:', error);
    return res.status(500).json({ error: error?.message || 'Test drive execution failure' });
  }
});

// Static File Serving for built React frontend
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

// 404 handler for API routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(`🚀 PromptOptimizer Multi-Platform Compiler Server active!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`========================================================\n`);
});

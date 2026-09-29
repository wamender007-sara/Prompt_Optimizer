import { executeTestDrive } from '../src/engine/compiler';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { masterPrompt, testPayload, mode } = body || {};
    if (!masterPrompt) {
      return res.status(400).json({ error: 'Missing "masterPrompt" field.' });
    }
    const result = executeTestDrive(masterPrompt, testPayload || '', mode || 'production_balanced');
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Execution failed' });
  }
}

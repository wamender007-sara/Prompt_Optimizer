import { compilePrompts } from '../src/engine/compiler';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { slots, mode } = body || {};
    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'Missing or invalid "slots" array.' });
    }
    const result = compilePrompts(slots, mode || 'production_balanced');
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Synthesis failed' });
  }
}

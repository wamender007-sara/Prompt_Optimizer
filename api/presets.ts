import { PRESET_SCENARIOS } from '../src/data/presets';

export default function handler(req: any, res: any) {
  return res.status(200).json({ presets: PRESET_SCENARIOS });
}

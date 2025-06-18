import dotenv from 'dotenv';

dotenv.config();

export class VirusTotalService {
  private static API_BASE = 'https://www.virustotal.com/api/v3';

  static async scanBuffer(buffer: Buffer, filename: string): Promise<boolean> {
    const apiKey = process.env.VT_API_KEY;
    if (!apiKey) {
      console.warn('VT_API_KEY not set, skipping virus scan');
      return true;
    }

    const form = new FormData();
    form.append('file', new Blob([buffer]), filename);

    const uploadResp = await fetch(`${this.API_BASE}/files`, {
      method: 'POST',
      headers: { 'x-apikey': apiKey },
      body: form,
    });

    if (!uploadResp.ok) {
      console.error('VirusTotal upload failed', await uploadResp.text());
      return false;
    }

    const uploadData = (await uploadResp.json()) as any;
    const analysisId = uploadData.data.id as string;

    // poll status
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const analysisResp = await fetch(`${this.API_BASE}/analyses/${analysisId}`, {
        headers: { 'x-apikey': apiKey },
      });
      if (!analysisResp.ok) continue;
      const analysis = (await analysisResp.json()) as any;
      if (analysis.data.attributes.status === 'completed') {
        const stats = analysis.data.attributes.stats || {};
        if (stats.malicious > 0 || stats.suspicious > 0) {
          return false;
        }
        return true;
      }
    }
    // If analysis not complete after polling, allow by default
    return true;
  }
}

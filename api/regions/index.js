import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Tüm bölgeleri getir
      const { rows } = await sql`SELECT * FROM regions ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      // Yeni bölge ekle
      const { name, category, map, description, image } = req.body;
      
      const { rows } = await sql`
        INSERT INTO regions (name, category, map, description, image, created_at)
        VALUES (${name}, ${category}, ${map}, ${description || ''}, ${image || null}, NOW())
        RETURNING *
      `;
      
      return res.status(201).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}


import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Tek bir dış kaynağı getir
      const { rows } = await sql`SELECT * FROM external_resources WHERE id = ${id}`;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'External resource not found' });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'PUT') {
      // Dış kaynağı güncelle
      const { title, description, url } = req.body;
      
      const { rows } = await sql`
        UPDATE external_resources 
        SET title = ${title}, 
            description = ${description || ''}, 
            url = ${url || ''},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'External resource not found' });
      }
      
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      // Dış kaynağı sil
      const { rows } = await sql`DELETE FROM external_resources WHERE id = ${id} RETURNING *`;
      if (rows.length === 0) {
        return res.status(404).json({ error: 'External resource not found' });
      }
      return res.status(200).json({ message: 'External resource deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}


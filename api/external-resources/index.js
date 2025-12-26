import clientPromise from '../db.js';

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
    const client = await clientPromise;
    const db = client.db('archub');
    const collection = db.collection('external_resources');

    if (req.method === 'GET') {
      // Tüm dış kaynakları getir
      const resources = await collection.find({}).sort({ created_at: -1 }).toArray();
      return res.status(200).json(resources.map(resource => ({ ...resource, id: resource._id })));
    }

    if (req.method === 'POST') {
      // Yeni dış kaynak ekle
      const { title, description, url } = req.body;
      
      const resource = {
        title,
        description: description || '',
        url: url || '',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const result = await collection.insertOne(resource);
      const newResource = { ...resource, id: result.insertedId };
      
      return res.status(201).json(newResource);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

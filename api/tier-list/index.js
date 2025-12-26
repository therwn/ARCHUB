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
    const collection = db.collection('tier_list');

    if (req.method === 'GET') {
      // Tüm tier list öğelerini getir
      const items = await collection.find({}).sort({ created_at: -1 }).toArray();
      return res.status(200).json(items.map(item => ({ ...item, id: item._id })));
    }

    if (req.method === 'POST') {
      // Yeni tier list öğesi ekle
      const { title, description, image } = req.body;
      
      const item = {
        title,
        description: description || '',
        image: image || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const result = await collection.insertOne(item);
      const newItem = { ...item, _id: result.insertedId, id: result.insertedId.toString() };
      
      return res.status(201).json(newItem);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

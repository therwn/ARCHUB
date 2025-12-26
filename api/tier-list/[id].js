import { ObjectId } from 'mongodb';
import clientPromise from '../db.js';

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
    const client = await clientPromise;
    const db = client.db('archub');
    const collection = db.collection('tier_list');

    // MongoDB ObjectId'ye çevir
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (req.method === 'GET') {
      // Tek bir tier list öğesini getir
      const item = await collection.findOne({ _id: objectId });
      if (!item) {
        return res.status(404).json({ error: 'Tier list item not found' });
      }
      return res.status(200).json({ ...item, id: item._id });
    }

    if (req.method === 'PUT') {
      // Tier list öğesini güncelle
      const { title, description, image } = req.body;
      
      const updateData = {
        title,
        description: description || '',
        image: image || null,
        updated_at: new Date()
      };
      
      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return res.status(404).json({ error: 'Tier list item not found' });
      }
      
      return res.status(200).json({ ...result.value, id: result.value._id.toString() });
    }

    if (req.method === 'DELETE') {
      // Tier list öğesini sil
      const result = await collection.findOneAndDelete({ _id: objectId });
      if (!result.value) {
        return res.status(404).json({ error: 'Tier list item not found' });
      }
      return res.status(200).json({ message: 'Tier list item deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

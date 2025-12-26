import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

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
    await client.connect();
    const db = client.db('archub');
    const collection = db.collection('regions');

    // MongoDB ObjectId'ye çevir
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (req.method === 'GET') {
      // Tek bir bölgeyi getir
      const region = await collection.findOne({ _id: objectId });
      if (!region) {
        return res.status(404).json({ error: 'Region not found' });
      }
      return res.status(200).json({ ...region, id: region._id });
    }

    if (req.method === 'PUT') {
      // Bölgeyi güncelle
      const { name, category, map, description, image } = req.body;
      
      const updateData = {
        name,
        category,
        map,
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
        return res.status(404).json({ error: 'Region not found' });
      }
      
      return res.status(200).json({ ...result.value, id: result.value._id });
    }

    if (req.method === 'DELETE') {
      // Bölgeyi sil
      const result = await collection.findOneAndDelete({ _id: objectId });
      if (!result.value) {
        return res.status(404).json({ error: 'Region not found' });
      }
      return res.status(200).json({ message: 'Region deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
}

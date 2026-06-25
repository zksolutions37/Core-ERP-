import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // Handle Preflight OPTIONS Request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, path, data, merge } = req.body;

  try {
    const docRef = db.doc(path);

    if (action === 'getDoc') {
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(200).json({ exists: false });
      }
      return res.status(200).json({ exists: true, data: docSnap.data() });
    } 
    
    else if (action === 'getDocs') {
      // Agar direct collection ka data chahiye (jaise list display karne ke liye)
      const collectionsSnap = await db.collection(path).get();
      const docs = [];
      collectionsSnap.forEach(doc => {
        docs.push({ id: doc.id, data: doc.data() });
      });
      return res.status(200).json({ docs });
    } 
    
    else if (action === 'setDoc') {
      await docRef.set(data, { merge: !!merge });
      return res.status(200).json({ success: true });
    } 
    
    else if (action === 'updateDoc') {
      await docRef.update(data);
      return res.status(200).json({ success: true });
    } 
    
    else if (action === 'deleteDoc') {
      await docRef.delete();
      return res.status(200).json({ success: true });
    } 
    
    else {
      return res.status(400).json({ error: 'Invalid action query' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

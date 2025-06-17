import { auth } from '../../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return res.status(200).json({ user: userCredential.user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
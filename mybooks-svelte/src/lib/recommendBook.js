import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { user } from '$lib/stores/user';

export async function recommendBook(book, currentUser) {
  const bookId = book.id;
  const docRef = doc(db, 'recommended', bookId);
  const snap = await getDoc(docRef);
  const userEmail = currentUser || user.email;

  if (snap.exists()) {
    const data = snap.data();
    const alreadyRecommended = (data.recommendedBy || []).includes(userEmail);

    if (alreadyRecommended) {
      alert('Ya has recomendado este libro.');
      return;
    }

    await setDoc(docRef, {
      ...data,
      recommendedBy: [...data.recommendedBy, userEmail]
    });
  } else {
    await setDoc(docRef, {
      ...book,
      recommendedBy: [userEmail]
    });
  }

  alert('Libro recomendado correctamente.');
}

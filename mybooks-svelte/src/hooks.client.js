import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '$lib/firebase';
import { user } from '$lib/stores/user';

onAuthStateChanged(auth, (u) => {
  console.log('Cambio de sesión detectado:', u);
  user.set(u);
});
<script>
  import { auth, db } from '$lib/firebase';
  import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let name = '';
  let email = '';
  let password = '';
  let error = '';
  const close = () => dispatch('close');

  const handleRegister = async () => {
    error = '';
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Agrega el nombre al perfil de Firebase Auth
      await updateProfile(user, { displayName: name });

      // Guarda el usuario en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: serverTimestamp()
      });

      close(); // Cerrar modal si todo funciona
    } catch (err) {
      error = err.message;
      console.error(err);
      console.log(err.message);
    }
  };
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md p-8 relative">
    <button class="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" on:click={close}>×</button>
    
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Registrarse</h2>
    
    <form class="flex flex-col gap-4" on:submit|preventDefault={handleRegister}>
      <input
        type="text"
        bind:value={name}
        placeholder="Nombre"
        class="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <input
        type="email"
        bind:value={email}
        placeholder="Correo electrónico"
        class="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      <input
        type="password"
        bind:value={password}
        placeholder="Contraseña"
        class="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {#if error}<p class="text-red-600 text-sm text-center">{error}</p>{/if}
      
      <button
        type="submit"
        class="w-4/5 mx-auto bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
      >
        Crear cuenta
      </button>
    </form>
  </div>
</div>

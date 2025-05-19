<script>
  import { auth } from '$lib/firebase';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { user } from '$lib/stores/user';
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let error = '';
  const close = () => dispatch('close');

  const handleLogin = async () => {
    error = '';
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if ($user) {
        goto('/search');
      }
      close(); // cerrar modal si funciona
    } catch (err) {
      error = 'Correo o contraseña inválidos';
      console.error(err);
    }
  };
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-white/90 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md p-8 relative">
    <button class="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" on:click={close}>×</button>
    
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar sesión</h2>
    
    <form class="flex flex-col gap-4" on:submit|preventDefault={handleLogin}>
      <input
        type="email"
        bind:value={email}
        placeholder="Correo electrónico"
        class="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      
      <input
        type="password"
        bind:value={password}
        placeholder="Contraseña"
        class="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {#if error}<p class="text-red-600 text-sm text-center">{error}</p>{/if}
      
      <button
        type="submit"
        class="w-4/5 mx-auto bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Entrar
      </button>
    </form>
  </div>
</div>

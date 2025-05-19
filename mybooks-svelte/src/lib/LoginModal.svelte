<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  const close = () => dispatch('close');

  let email = '';
  let password = '';

  const handleLogin = () => {
    // Aquí luego iría la lógica Firebase
    console.log('Login con', email, password);
    close();
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
      
      <button
        type="submit"
        class="w-4/5 mx-auto bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Entrar
      </button>
    </form>
  </div>
</div>

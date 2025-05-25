<script>
  import { user } from '$lib/stores/user';
  import { auth } from '$lib/firebase';
  import { signOut } from 'firebase/auth';
  import { goto } from '$app/navigation';

  let currentUser;
  $: if ($user) {
    currentUser = $user.displayName || $user.email;
  }

  const cerrarSesion = async () => {
    await signOut(auth);
    goto('/');
  };
</script>

{#if $user}
  <p>Bienvenido, {currentUser}</p>
  <button on:click={cerrarSesion}>Cerrar sesión</button>
{:else}
  <p>No has iniciado sesión.</p>
{/if}
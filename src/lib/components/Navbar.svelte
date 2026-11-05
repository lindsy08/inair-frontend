
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let usuario = $state(null);
  let modulos = $state([]);

  onMount(() => {
    actualizarMenu();

    // Actualizar cuando cambie el almacenamiento
    window.addEventListener('storage', actualizarMenu);

    return () => {
      window.removeEventListener('storage', actualizarMenu);
    };
  });

  function actualizarMenu() {
    try {
      const datosUsuario = sessionStorage.getItem('usuario');
      const datosModulos = sessionStorage.getItem('modulos');

      usuario = datosUsuario
        ? JSON.parse(datosUsuario)
        : null;

      modulos = datosModulos
        ? JSON.parse(datosModulos)
        : [];
    } catch {
      usuario = null;
      modulos = [];
    }
  }

  // Al navegar, volver a leer la sesión.
  $effect(() => {
    const rutaActual = page.url.pathname;
    if (rutaActual) {
      actualizarMenu();
    }
  });

  async function cerrarSesion() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('modulos');

    usuario = null;
    modulos = [];

    await goto('/login');
  }
</script>

<nav class="navbar">
  <a href="/" class="navbar-logo">
    🌿 IN-AIR
  </a>

  <div class="navbar-links">
    {#if usuario}
      {#each modulos as modulo}
        <a href={modulo.ruta}>
          {modulo.nombre}
        </a>
      {/each}

      <button onclick={cerrarSesion}>
        Cerrar sesión
      </button>
    {:else}
      <a href="/">Inicio</a>
      <a href="/login">Iniciar sesión</a>
    {/if}
  </div>
</nav>

<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #1e3a8a;
    color: white;
    padding: 14px 24px;
    gap: 20px;
  }

  .navbar-logo {
    color: white;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.2rem;
    white-space: nowrap;
  }

  .navbar-links {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .navbar-links a,
  .navbar-links button {
    color: white;
    text-decoration: none;
    font-size: 14px;
  }

  .navbar-links a:hover {
    text-decoration: underline;
  }

  button {
    background: #ef4444;
    border: none;
    padding: 10px 14px;
    border-radius: 6px;
    cursor: pointer;
  }

  button:hover {
    background: #dc2626;
  }

  @media (max-width: 768px) {
    .navbar {
      flex-direction: column;
    }

    .navbar-links {
      justify-content: center;
    }
  }
</style>

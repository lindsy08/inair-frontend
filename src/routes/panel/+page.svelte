
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Header from '#lib/components/Header.svelte';
  import Card from '#lib/components/Card.svelte';

  let usuario = $state(null);
  let modulos = $state([]);

  onMount(() => {
    const token = sessionStorage.getItem('token');
    const usuarioGuardado = sessionStorage.getItem('usuario');
    const modulosGuardados = sessionStorage.getItem('modulos');

    if (!token || !usuarioGuardado) {
      goto('/login');
      return;
    }

    try {
      usuario = JSON.parse(usuarioGuardado);
      modulos = JSON.parse(modulosGuardados || '[]');
    } catch {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      sessionStorage.removeItem('modulos');
      goto('/login');
    }
  });
</script>

<svelte:head>
  <title>Panel | IN-AIR</title>
</svelte:head>

{#if usuario}
  <Header
    titulo={`Bienvenido, ${usuario.nombres}`}
    subtitulo={`Rol: ${usuario.rol}`}
  />

  <Card>
    <h2>Panel principal de IN-AIR</h2>

    <p>
      Desde aquí puedes acceder a los módulos
      autorizados para tu usuario.
    </p>

    <h3>Mis módulos</h3>

    {#if modulos.length > 0}
      <div class="modulos">
        {#each modulos as modulo}
          <a href={modulo.ruta} class="modulo">
            {modulo.nombre}
          </a>
        {/each}
      </div>
    {:else}
      <p>No hay módulos asignados a tu usuario.</p>
    {/if}
  </Card>
{:else}
  <p>Verificando sesión...</p>
{/if}

<style>
  .modulos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 15px;
    margin-top: 20px;
  }

  .modulo {
    display: block;
    background-color: #1e3a8a;
    color: white;
    text-decoration: none;
    padding: 18px;
    border-radius: 8px;
    text-align: center;
    font-weight: bold;
  }

  .modulo:hover {
    background-color: #2563eb;
  }
</style>

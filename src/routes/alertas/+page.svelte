
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import Header from '#lib/components/Header.svelte';
  import Card from '#lib/components/Card.svelte';
  import DataTable from '#lib/components/DataTable.svelte';

  import {
    obtenerAlertas,
    atenderAlerta
  } from '#lib/services/api_alerta.js';

  let alertas = $state([]);
  let cargando = $state(true);
  let guardando = $state(null);
  let error = $state('');
  let mensaje = $state('');
  let versionTabla = $state(0);

  const columnas = [
    { titulo: 'Mensaje', campo: 'mensaje' },
    { titulo: 'Lectura', campo: 'lectura' },
    { titulo: 'Estado de atención', campo: 'atencion' },
    { titulo: 'Fecha', campo: 'fecha' }
  ];

  function estaAtendida(alerta) {
    return (
      alerta.atendida === true ||
      alerta.atendida === 1 ||
      alerta.atendida === '1'
    );
  }

  function mostrarFecha(fecha) {
    if (!fecha) return 'Sin fecha';

    const valor = new Date(fecha);

    return Number.isNaN(valor.getTime())
      ? String(fecha)
      : valor.toLocaleString('es-CO');
  }

  let filas = $derived(
    alertas.map((alerta) => ({
      mensaje: alerta.mensaje ?? 'Sin descripción',
      lectura: alerta.lectura ?? alerta.valor ?? 'No disponible',
      atencion: estaAtendida(alerta)
        ? 'Atendida'
        : 'Pendiente',
      fecha: mostrarFecha(alerta.creado)
    }))
  );

  let pendientes = $derived(
    alertas.filter((alerta) => !estaAtendida(alerta))
  );

  onMount(async () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
      await goto('/login');
      return;
    }

    let modulos = [];

    try {
      modulos = JSON.parse(
        sessionStorage.getItem('modulos') || '[]'
      );
    } catch {
      await goto('/login');
      return;
    }

    const permitido = modulos.some(
      (modulo) => modulo.ruta === '/alertas'
    );

    if (!permitido) {
      await goto('/panel');
      return;
    }

    await cargarAlertas();
  });

  async function cargarAlertas() {
    cargando = true;
    error = '';

    try {
      const respuesta = await obtenerAlertas();

      if (Array.isArray(respuesta)) {
        alertas = respuesta;
      } else if (Array.isArray(respuesta?.items)) {
        alertas = respuesta.items;
      } else {
        throw new Error(
          'La API devolvió un formato inesperado'
        );
      }

      versionTabla += 1;
    } catch (e) {
      error = e.message || 'No se pudieron cargar las alertas';
    } finally {
      cargando = false;
    }
  }

  async function marcarAtendida(alerta) {
    if (guardando !== null) return;

    const confirmar = confirm(
      '¿Deseas marcar esta alerta como atendida?'
    );

    if (!confirmar) return;

    guardando = alerta.id;
    error = '';
    mensaje = '';

    try {
      await atenderAlerta(alerta.id);

      mensaje = 'Alerta marcada como atendida correctamente.';

      await cargarAlertas();
    } catch (e) {
      error = e.message || 'No se pudo atender la alerta';
    } finally {
      guardando = null;
    }
  }
</script>

<svelte:head>
  <title>Alertas | IN-AIR</title>
</svelte:head>

<Header
  titulo="Alertas ambientales"
  subtitulo="Seguimiento de condiciones de calidad del aire"
/>

<Card>
  <div class="barra">
    <h2>Historial de alertas</h2>

    <button onclick={cargarAlertas} disabled={cargando}>
      {cargando ? 'Cargando...' : 'Actualizar'}
    </button>
  </div>

  {#if cargando}
    <p role="status">Consultando alertas...</p>

  {:else if error && alertas.length === 0}
    <p class="error" role="alert">{error}</p>

  {:else}
    {#key versionTabla}
      <DataTable {columnas} {filas} />
    {/key}
  {/if}
</Card>

<Card>
  <h2>Alertas pendientes de atención</h2>

  {#if error}
    <p class="error" role="alert">{error}</p>
  {/if}

  {#if mensaje}
    <p class="exito" role="status">{mensaje}</p>
  {/if}

  {#if !cargando && pendientes.length === 0}
    <p>No hay alertas pendientes.</p>
  {:else}
    <div class="lista-alertas">
      {#each pendientes as alerta (alerta.id)}
        <div class="alerta">
          <div class="informacion">
            <strong>{alerta.mensaje}</strong>
            <span>
              {mostrarFecha(alerta.creado)}
            </span>
          </div>

          <button
            class="atender"
            onclick={() => marcarAtendida(alerta)}
            disabled={guardando !== null || cargando}
          >
            {guardando === alerta.id
              ? 'Guardando...'
              : 'Marcar como atendida'}
          </button>
        </div>
      {/each}
    </div>
  {/if}
</Card>

<style>
  .barra {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  h2 {
    color: #1e3a8a;
    margin: 0 0 15px;
  }

  button {
    background: #1e3a8a;
    color: white;
    padding: 11px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .lista-alertas {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .alerta {
    border: 1px solid #e2e8f0;
    border-left: 4px solid #f59e0b;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    background: #fff;
  }

  .informacion {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .informacion strong {
    color: #334155;
  }

  .informacion span {
    color: #64748b;
    font-size: 13px;
  }

  .atender {
    background: #16835d;
    flex-shrink: 0;
  }

  .atender:hover:not(:disabled) {
    background: #106747;
  }

  .error {
    background: #fef2f2;
    color: #b91c1c;
    padding: 12px;
    border-radius: 8px;
  }

  .exito {
    background: #ecfdf5;
    color: #166534;
    padding: 12px;
    border-radius: 8px;
  }

  @media (max-width: 600px) {
    .alerta {
      flex-direction: column;
      align-items: stretch;
    }

    .atender {
      width: 100%;
    }
  }
</style>

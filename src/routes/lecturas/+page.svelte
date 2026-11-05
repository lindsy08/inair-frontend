
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import Header from '#lib/components/Header.svelte';
  import Card from '#lib/components/Card.svelte';
  import DataTable from '#lib/components/DataTable.svelte';
  import FormularioLectura from '#lib/components/FormularioLectura.svelte';

  import {
    obtenerLecturas
  } from '#lib/services/api_lectura.js';

  let lecturas = $state([]);
  let cargando = $state(true);
  let error = $state('');
  let versionTabla = $state(0);
  let puedeRegistrar = $state(false);

  const columnas = [
    { titulo: 'Sensor', campo: 'sensor' },
    { titulo: 'Valor', campo: 'valor' },
    { titulo: 'Fecha de lectura', campo: 'fecha' }
  ];

  let filas = $derived(
    lecturas.map((lectura) => ({
      sensor: lectura.sensor || lectura.tipo || 'Sensor',
      valor: lectura.valor,
      fecha: mostrarFecha(lectura.fecha_lectura)
    }))
  );

  onMount(async () => {
    const token = sessionStorage.getItem('token');

    let modulos = [];

    try {
      modulos = JSON.parse(
        sessionStorage.getItem('modulos') || '[]'
      );
    } catch {
      await goto('/login');
      return;
    }

    if (!token) {
      await goto('/login');
      return;
    }

    const permitido = modulos.some(
      (modulo) => modulo.ruta === '/lecturas'
    );

    if (!permitido) {
      await goto('/panel');
      return;
    }

    
const usuario = JSON.parse(
  sessionStorage.getItem('usuario') || '{}'
);

puedeRegistrar = ['Administrador', 'Técnico'].includes(
  usuario.rol
);


    await cargarLecturas();
  });

  async function cargarLecturas() {
    cargando = true;
    error = '';

    try {
      const datos = await obtenerLecturas();

      if (Array.isArray(datos)) {
        lecturas = datos;
      } else if (Array.isArray(datos?.items)) {
        lecturas = datos.items;
      } else {
        throw new Error(
          'La API devolvió un formato inesperado'
        );
      }

      versionTabla += 1;

    } catch (e) {
      error = e.message || 'Error al cargar lecturas';
    } finally {
      cargando = false;
    }
  }

  function mostrarFecha(fecha) {
    if (!fecha) return 'Sin fecha';

    const valor = new Date(fecha);

    return Number.isNaN(valor.getTime())
      ? String(fecha)
      : valor.toLocaleString('es-CO');
  }
</script>

<svelte:head>
  <title>Lecturas | IN-AIR</title>
</svelte:head>

<Header
  titulo="Lecturas ambientales"
  subtitulo="Monitoreo de la calidad del aire en espacios educativos"
/>


<!-- FORMULARIO PARA REGISTRAR LECTURAS -->
{#if puedeRegistrar}
  <Card>
    <FormularioLectura alGuardar={cargarLecturas} />
  </Card>
{/if}

<!-- AQUÍ CONTINÚA EL CARD DE HISTORIAL DE MEDICIONES -->


<Card>
  <div class="barra">
    <h2>Historial de mediciones</h2>

    <button
      onclick={cargarLecturas}
      disabled={cargando}
    >
      {cargando ? 'Cargando...' : 'Actualizar'}
    </button>
  </div>

  {#if cargando}
    <p role="status">Consultando mediciones...</p>

  {:else if error}
    <p class="error" role="alert">{error}</p>

  {:else}
    {#key versionTabla}
      <DataTable
        {columnas}
        {filas}
      />
    {/key}
  {/if}
</Card>

<style>
  .barra {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;
  }

  h2 {
    color: #1e3a8a;
    margin: 0;
  }

  button {
    background: #1e3a8a;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 11px 18px;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .error {
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 8px;
    padding: 12px;
  }

  @media (max-width: 600px) {
    h2 {
      font-size: 19px;
    }
  }
</style>

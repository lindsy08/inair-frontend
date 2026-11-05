
<script>
  import { onMount } from 'svelte';
  import { obtenerSensores } from '#lib/services/api_sensor.js';
  import { crearLectura } from '#lib/services/api_lectura.js';

  let { alGuardar = () => {} } = $props();

  let sensores = $state([]);
  let sensorSeleccionado = $state('');
  let valor = $state('');
  let cargando = $state(false);
  let guardando = $state(false);
  let error = $state('');
  let mensaje = $state('');

  onMount(async () => {
    cargando = true;

    try {
      const respuesta = await obtenerSensores();

      sensores = Array.isArray(respuesta)
        ? respuesta
        : respuesta.items ?? [];
    } catch (e) {
      error = e.message || 'No se pudieron cargar los sensores';
    } finally {
      cargando = false;
    }
  });

  function nombreSensor(sensor) {
    return [
      sensor.dispositivo || 'Dispositivo',
      sensor.tipo || 'Sensor',
      sensor.unidad ? `(${sensor.unidad})` : ''
    ].join(' ');
  }

  async function registrar(evento) {
    evento.preventDefault();

    error = '';
    mensaje = '';

    if (!sensorSeleccionado || valor === '') {
      error = 'Selecciona un sensor e ingresa un valor.';
      return;
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero) || numero < 0) {
      error = 'Ingresa una medición válida.';
      return;
    }

    guardando = true;

    try {
      const respuesta = await crearLectura({
        id_sensor: Number(sensorSeleccionado),
        valor: numero
      });

      mensaje = respuesta?.alerta_generada
        ? 'Lectura registrada. Se generó una alerta ambiental.'
        : 'Lectura registrada correctamente.';

      sensorSeleccionado = '';
      valor = '';

      await alGuardar();
    } catch (e) {
      error = e.message || 'No se pudo registrar la lectura';
    } finally {
      guardando = false;
    }
  }
</script>

<section class="formulario">
  <h3>Registrar nueva lectura</h3>

  {#if cargando}
    <p>Cargando sensores disponibles...</p>
  {:else}
    <form onsubmit={registrar}>
      <div class="campo">
        <label for="sensor">Sensor</label>
        <select
          id="sensor"
          bind:value={sensorSeleccionado}
          required
          disabled={guardando}
        >
          <option value="">Selecciona un sensor</option>

          {#each sensores as sensor (sensor.id)}
            <option value={String(sensor.id)}>
              {nombreSensor(sensor)}
            </option>
          {/each}
        </select>
      </div>

      <div class="campo">
        <label for="valor">Valor de la medición</label>
        <input
          id="valor"
          type="number"
          step="any"
          min="0"
          bind:value={valor}
          placeholder="Ejemplo: 1250"
          required
          disabled={guardando}
        />
      </div>

      <button type="submit" disabled={guardando || sensores.length === 0}>
        {guardando ? 'Guardando...' : 'Registrar lectura'}
      </button>
    </form>
  {/if}

  {#if error}
    <p class="error" role="alert">{error}</p>
  {/if}

  {#if mensaje}
    <p class="exito" role="status">{mensaje}</p>
  {/if}
</section>

<style>
  .formulario {
    background: #f8fafc;
    padding: 22px;
    border-radius: 10px;
  }

  h3 {
    color: #1e3a8a;
    margin-top: 0;
  }

  form {
    display: grid;
    gap: 18px;
  }

  .campo {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  label {
    font-weight: 600;
  }

  input,
  select {
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 15px;
    width: 100%;
    box-sizing: border-box;
  }

  button {
    background: #1e3a8a;
    color: white;
    padding: 13px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
  }

  button:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .error {
    color: #b91c1c;
  }

  .exito {
    color: #166534;
  }
</style>

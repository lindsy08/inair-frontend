
<script>
  let {
    roles = [],
    usuarioEditar = null,
    alGuardar = () => {},
    alCancelar = () => {}
  } = $props();

  let idRol = $state('');
  let nombres = $state('');
  let apellidos = $state('');
  let correo = $state('');
  let contrasena = $state('');
  let telefono = $state('');
  let error = $state('');
  let guardando = $state(false);

  let editando = $derived(usuarioEditar !== null);

  // Cargar los datos cuando se selecciona un usuario.
  $effect(() => {
    const usuario = usuarioEditar;

    idRol = usuario?.id_rol != null
      ? String(usuario.id_rol)
      : '';

    nombres = usuario?.nombres ?? '';
    apellidos = usuario?.apellidos ?? '';
    correo = usuario?.correo ?? '';
    telefono = usuario?.telefono ?? '';

    // Nunca mostrar una contraseña almacenada.
    contrasena = '';
    error = '';
  });

  async function prepararRegistro(evento) {
    evento.preventDefault();
    if (guardando) return;

    error = '';

    if (
      !idRol ||
      !nombres.trim() ||
      !apellidos.trim() ||
      !correo.trim()
    ) {
      error = 'Completa los campos obligatorios.';
      return;
    }

    const usuario = {
      id_rol: Number(idRol),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      correo: correo.trim(),
      telefono: telefono.trim() || null
    };

    // Solo enviar una contraseña cuando se escribe una.
    if (contrasena) {
      usuario.contrasena = contrasena;
    } else if (!editando) {
      usuario.contrasena = null;
    }

    guardando = true;

    try {
      await alGuardar(usuario);

      if (!editando) {
        idRol = '';
        nombres = '';
        apellidos = '';
        correo = '';
        contrasena = '';
        telefono = '';
      }
    } catch (e) {
      error = e.message || 'No se pudieron guardar los datos.';
    } finally {
      guardando = false;
    }
  }
</script>

<section class="formulario">
  <h2>
    {editando ? 'Editar usuario' : 'Registrar nuevo usuario'}
  </h2>

  <form onsubmit={prepararRegistro}>
    <div class="campos">
      <div>
        <label for="nombres">Nombres *</label>
        <input
          id="nombres"
          bind:value={nombres}
          required
          disabled={guardando}
        />
      </div>

      <div>
        <label for="apellidos">Apellidos *</label>
        <input
          id="apellidos"
          bind:value={apellidos}
          required
          disabled={guardando}
        />
      </div>

      <div>
        <label for="correo">Correo electrónico *</label>
        <input
          id="correo"
          type="email"
          bind:value={correo}
          required
          disabled={guardando}
        />
      </div>

      <div>
        <label for="rol">Rol *</label>
        <select
          id="rol"
          bind:value={idRol}
          required
          disabled={guardando}
        >
          <option value="">Selecciona un rol</option>
          {#each roles as rol}
            <option value={String(rol.id)}>
              {rol.nombre}
            </option>
          {/each}
        </select>
      </div>

      <div>
        <label for="contrasena">
          {editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
        </label>
        <input
          id="contrasena"
          type="password"
          bind:value={contrasena}
          autocomplete="new-password"
          disabled={guardando}
        />
      </div>

      <div>
        <label for="telefono">Teléfono</label>
        <input
          id="telefono"
          type="tel"
          bind:value={telefono}
          disabled={guardando}
        />
      </div>
    </div>

    {#if error}
      <p class="error" role="alert">{error}</p>
    {/if}

    <div class="botones">
      <button
        type="submit"
        disabled={guardando || roles.length === 0}
      >
        {guardando
          ? 'Guardando...'
          : editando
            ? 'Guardar cambios'
            : 'Registrar usuario'}
      </button>

      {#if editando}
        <button
          type="button"
          class="cancelar"
          onclick={alCancelar}
          disabled={guardando}
        >
          Cancelar edición
        </button>
      {/if}
    </div>
  </form>

  {#if roles.length === 0}
    <p class="aviso">
      No hay roles disponibles para seleccionar.
    </p>
  {/if}
</section>

<style>
  h2 {
    color: #1e3a8a;
    margin-bottom: 20px;
  }

  .campos {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 7px;
    font-weight: 600;
    color: #334155;
  }

  input,
  select {
    width: 100%;
    box-sizing: border-box;
    padding: 11px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
  }

  .botones {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  button {
    background: #1e3a8a;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    cursor: pointer;
  }

  .cancelar {
    background: #64748b;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    color: #b91c1c;
  }

  .aviso {
    color: #64748b;
    font-size: 14px;
  }

  @media (max-width: 600px) {
    .campos {
      grid-template-columns: 1fr;
    }
  }
</style>


<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import Header from '#lib/components/Header.svelte';
  import Card from '#lib/components/Card.svelte';
  import DataTable from '#lib/components/DataTable.svelte';
  import FormularioUsuario from '#lib/components/FormularioUsuario.svelte';

  import { obtenerRoles } from '#lib/services/api_rol.js';

  import {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario
  } from '#lib/services/api_usuario.js';

  // ESTADO GENERAL
  let usuarios = $state([]);
  let roles = $state([]);

  let cargando = $state(true);
  let guardando = $state(false);

  let error = $state('');
  let errorRoles = $state('');
  let mensaje = $state('');

  let versionTabla = $state(0);
  let usuarioEditar = $state(null);

  // COLUMNAS DEL DATATABLE
  const columnas = [
    { titulo: 'Nombre', campo: 'nombre' },
    { titulo: 'Correo electrónico', campo: 'correo' },
    { titulo: 'Rol', campo: 'rol' },
    { titulo: 'Estado', campo: 'estado' }
  ];

  // COMPROBAR SI EL USUARIO ESTÁ ACTIVO
  function estaActivo(usuario) {
    return !(
      usuario.estado === 0 ||
      usuario.estado === false ||
      usuario.estado === '0'
    );
  }

  // PREPARAR LOS DATOS DEL DATATABLE
  let filas = $derived(
    usuarios.map((usuario) => ({
      nombre:
        [usuario.nombres, usuario.apellidos]
          .filter(Boolean)
          .join(' ') ||
        usuario.nombre ||
        'Sin nombre',

      correo: usuario.correo ?? 'Sin correo',

      rol:
        usuario.rol ??
        usuario.nombre_rol ??
        roles.find(
          (rol) =>
            Number(rol.id) === Number(usuario.id_rol)
        )?.nombre ??
        'No especificado',

      estado: estaActivo(usuario)
        ? 'Activo'
        : 'Inactivo'
    }))
  );

  // VERIFICAR SESIÓN Y ACCESO
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
      (modulo) => modulo.ruta === '/usuarios'
    );

    if (!permitido) {
      await goto('/panel');
      return;
    }

    await Promise.all([
      cargarUsuarios(),
      cargarRoles()
    ]);
  });

  // CONSULTAR USUARIOS
  async function cargarUsuarios() {
    cargando = true;
    error = '';

    try {
      const respuesta = await obtenerUsuarios();

      if (Array.isArray(respuesta)) {
        usuarios = respuesta;
      } else if (Array.isArray(respuesta?.items)) {
        usuarios = respuesta.items;
      } else {
        throw new Error(
          'La API devolvió un formato inesperado'
        );
      }

      versionTabla += 1;
    } catch (e) {
      error =
        e.message ||
        'No se pudieron cargar los usuarios';
    } finally {
      cargando = false;
    }
  }

  // CONSULTAR ROLES
  async function cargarRoles() {
    errorRoles = '';

    try {
      const respuesta = await obtenerRoles();

      if (Array.isArray(respuesta)) {
        roles = respuesta;
      } else if (Array.isArray(respuesta?.items)) {
        roles = respuesta.items;
      } else {
        throw new Error(
          'La API devolvió un formato de roles inesperado'
        );
      }
    } catch (e) {
      errorRoles =
        e.message ||
        'No se pudieron cargar los roles';
    }
  }

  // REGISTRAR O EDITAR USUARIOS
  async function guardarUsuario(datos) {
    if (guardando) {
      throw new Error('Ya hay una operación en proceso.');
    }

    guardando = true;
    mensaje = '';
    errorRoles = '';

    try {
      if (usuarioEditar) {
        const id = usuarioEditar.id;

        if (id == null) {
          throw new Error(
            'El usuario seleccionado no tiene un ID válido.'
          );
        }

        await actualizarUsuario(id, datos);

        usuarioEditar = null;
        mensaje = 'Usuario actualizado correctamente.';
      } else {
        await crearUsuario(datos);

        mensaje = 'Usuario registrado correctamente.';
      }

      await cargarUsuarios();
    } catch (e) {
      errorRoles =
        e.message ||
        'No se pudieron guardar los datos.';

      throw e;
    } finally {
      guardando = false;
    }
  }

  // SELECCIONAR USUARIO PARA EDITAR
  function seleccionarUsuario(usuario) {
    if (!estaActivo(usuario)) return;

    usuarioEditar = usuario;
    mensaje = '';
    errorRoles = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // CANCELAR EDICIÓN
  function cancelarEdicion() {
    usuarioEditar = null;
    mensaje = '';
    errorRoles = '';
  }

  // DESACTIVAR USUARIO
  async function confirmarDesactivacion(usuario) {
    if (guardando || !estaActivo(usuario)) return;

    const usuarioSesion = JSON.parse(
      sessionStorage.getItem('usuario') || '{}'
    );

    // Evitar desactivar la propia cuenta
    if (
      usuarioSesion.correo?.toLowerCase() ===
      usuario.correo?.toLowerCase()
    ) {
      errorRoles =
        'No puedes desactivar tu propia cuenta desde esta pantalla.';
      return;
    }

    const nombre = [
      usuario.nombres,
      usuario.apellidos
    ].filter(Boolean).join(' ');

    const confirmar = window.confirm(
      `¿Deseas desactivar a ${nombre}?\n\n` +
      'El usuario quedará inactivo y no se eliminará definitivamente.'
    );

    if (!confirmar) return;

    guardando = true;
    errorRoles = '';
    mensaje = '';

    try {
      await desactivarUsuario(usuario.id);

      // Cancelar edición si se desactiva el usuario seleccionado
      if (usuarioEditar?.id === usuario.id) {
        usuarioEditar = null;
      }

      await cargarUsuarios();

      mensaje =
        'Usuario desactivado correctamente.';
    } catch (e) {
      errorRoles =
        e.message ||
        'No se pudo desactivar el usuario.';
    } finally {
      guardando = false;
    }
  }
</script>

<svelte:head>
  <title>Usuarios | IN-AIR</title>
</svelte:head>

<Header
  titulo="Gestión de usuarios"
  subtitulo="Registro, consulta, edición y desactivación de usuarios de IN-AIR"
/>

<!-- FORMULARIO PARA REGISTRAR Y EDITAR -->
<Card>
  {#if errorRoles}
    <p class="error" role="alert">
      {errorRoles}
    </p>
  {/if}

  {#if mensaje}
    <p class="exito" role="status">
      {mensaje}
    </p>
  {/if}

  <FormularioUsuario
    {roles}
    {usuarioEditar}
    alGuardar={guardarUsuario}
    alCancelar={cancelarEdicion}
  />
</Card>

<!-- HISTORIAL DE USUARIOS EN DATATABLE -->
<Card>
  <div class="barra">
    <h2>Usuarios registrados</h2>

    <button
      type="button"
      onclick={cargarUsuarios}
      disabled={cargando || guardando}
    >
      {cargando ? 'Cargando...' : 'Actualizar'}
    </button>
  </div>

  {#if cargando}
    <p role="status">
      Consultando usuarios...
    </p>
  {:else if error}
    <p class="error" role="alert">
      {error}
    </p>
  {:else}
    <p class="total">
      Total de usuarios: {usuarios.length}
    </p>

    {#key versionTabla}
      <DataTable {columnas} {filas} />
    {/key}
  {/if}
</Card>

<!-- ACCIONES DE USUARIOS -->
<Card>
  <h2>Administrar usuarios registrados</h2>

  <p class="descripcion">
    Puedes modificar los datos de un usuario activo o
    desactivarlo sin eliminar su registro de la base de datos.
  </p>

  {#if cargando}
    <p>Cargando usuarios...</p>
  {:else if usuarios.length === 0}
    <p>No hay usuarios disponibles.</p>
  {:else}
    <div class="lista-edicion">
      {#each usuarios as usuario (usuario.id)}
        <div class="fila-edicion">
          <div class="informacion">
            <strong>
              {usuario.nombres} {usuario.apellidos}
            </strong>

            <p>{usuario.correo}</p>

            {#if estaActivo(usuario)}
              <span class="estado activo">Activo</span>
            {:else}
              <span class="estado inactivo">Inactivo</span>
            {/if}
          </div>

          <div class="acciones">
            <button
              type="button"
              onclick={() => seleccionarUsuario(usuario)}
              disabled={guardando || !estaActivo(usuario)}
            >
              Editar
            </button>

            {#if estaActivo(usuario)}
              <button
                type="button"
                class="desactivar"
                onclick={() => confirmarDesactivacion(usuario)}
                disabled={guardando}
              >
                Desactivar
              </button>
            {/if}
          </div>
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
    margin: 0 0 16px;
    color: #1e3a8a;
  }

  button {
    background: #1e3a8a;
    color: white;
    padding: 11px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
  }

  button:hover:not(:disabled) {
    background: #152c6a;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .total,
  .descripcion {
    color: #64748b;
    margin-bottom: 16px;
  }

  .error {
    background: #fef2f2;
    color: #b91c1c;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .exito {
    background: #ecfdf5;
    color: #166534;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .lista-edicion {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .fila-edicion {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding: 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #ffffff;
  }

  .informacion {
    min-width: 0;
  }

  .informacion strong {
    color: #334155;
  }

  .informacion p {
    color: #64748b;
    margin: 5px 0 8px;
    overflow-wrap: anywhere;
  }

  .estado {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 600;
  }

  .activo {
    background: #dcfce7;
    color: #166534;
  }

  .inactivo {
    background: #fee2e2;
    color: #991b1b;
  }

  .acciones {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex-shrink: 0;
  }

  .desactivar {
    background: #b91c1c;
  }

  .desactivar:hover:not(:disabled) {
    background: #991b1b;
  }

  @media (max-width: 600px) {
    .fila-edicion {
      flex-direction: column;
      align-items: stretch;
    }

    .acciones {
      flex-direction: column;
      width: 100%;
    }

    .acciones button {
      width: 100%;
    }
  }
</style>

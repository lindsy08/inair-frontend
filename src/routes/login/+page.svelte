
<script>
  import { solicitarAPI } from '#lib/services/api.js';
  import { goto } from '$app/navigation';

  let correo = $state('');
  let contrasena = $state('');
  let cargando = $state(false);
  let error = $state('');

  async function iniciarSesion(evento) {
    evento.preventDefault();

    error = '';
    cargando = true;

    try {
      const respuesta = await solicitarAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          correo,
          contrasena
        })
      });

      if (!respuesta.token || !respuesta.usuario) {
        throw new Error('Respuesta de autenticación inválida');
      }

      sessionStorage.setItem('token', respuesta.token);
      sessionStorage.setItem(
        'usuario',
        JSON.stringify(respuesta.usuario)
      );
      sessionStorage.setItem(
        'modulos',
        JSON.stringify(respuesta.modulos ?? [])
      );

      await goto('/panel');

    } catch (e) {
      error = e.message || 'No se pudo iniciar sesión';
    } finally {
      cargando = false;
    }
  }
</script>

<svelte:head>
  <title>Iniciar sesión | IN-AIR</title>
</svelte:head>

<section class="login">
  <div class="login-card">
    <div class="logo">🌿</div>

    <h1>IN-AIR</h1>
    <p>Inicia sesión para acceder al sistema</p>

    <form onsubmit={iniciarSesion}>
      <label for="correo">Correo electrónico</label>
      <input
        id="correo"
        type="email"
        bind:value={correo}
        placeholder="correo@inair.com"
        autocomplete="username"
        required
        disabled={cargando}
      />

      <label for="contrasena">Contraseña</label>
      <input
        id="contrasena"
        type="password"
        bind:value={contrasena}
        placeholder="Ingresa tu contraseña"
        autocomplete="current-password"
        required
        disabled={cargando}
      />

      {#if error}
        <p class="error" role="alert">{error}</p>
      {/if}

      <button type="submit" disabled={cargando}>
        {cargando ? 'Conectando, por favor espera...' : 'Iniciar sesión'}
      </button>
    </form>
  </div>
</section>

<style>
  .login {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .login-card {
    background: white;
    padding: 36px;
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 420px;
    box-sizing: border-box;
  }

  .logo {
    text-align: center;
    font-size: 40px;
  }

  h1 {
    color: #1e3a8a;
    text-align: center;
    margin-bottom: 8px;
  }

  .login-card > p {
    text-align: center;
    color: #64748b;
    margin-bottom: 28px;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  label {
    font-weight: 600;
    color: #334155;
  }

  input {
    padding: 13px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 15px;
    min-width: 0;
  }

  input:focus {
    outline: 2px solid #1e3a8a;
    outline-offset: 1px;
  }

  button {
    background: #1e3a8a;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 12px;
  }

  button:hover:not(:disabled) {
    background: #172f70;
  }

  button:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  .error {
    color: #b91c1c;
    background: #fef2f2;
    padding: 12px;
    border-radius: 6px;
    font-size: 14px;
  }
</style>

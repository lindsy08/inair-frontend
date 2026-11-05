
import { solicitarAPI } from './api.js';

// Consultar usuarios
export async function obtenerUsuarios() {
  return await solicitarAPI('/usuarios/');
}

// Registrar un usuario
export async function crearUsuario(usuario) {
  return await solicitarAPI('/usuarios/', {
    method: 'POST',
    body: JSON.stringify(usuario)
  });
}

// Actualizar un usuario
export async function actualizarUsuario(id, usuario) {
  return await solicitarAPI(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(usuario)
  });
}

// Desactivar un usuario (eliminación lógica)
export async function desactivarUsuario(id) {
  return await solicitarAPI(`/usuarios/${id}`, {
    method: 'DELETE'
  });
}

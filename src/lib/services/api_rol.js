
import { solicitarAPI } from './api.js';

// Consultar los roles registrados en IN-AIR
export async function obtenerRoles() {
  return await solicitarAPI('/roles/');
}

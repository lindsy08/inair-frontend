
import { solicitarAPI } from './api.js';

// Obtener todas las lecturas
export async function obtenerLecturas() {
  return await solicitarAPI('/lecturas/');
}

// Obtener una lectura por su ID
export async function obtenerLecturaPorId(id) {
  return await solicitarAPI(`/lecturas/${id}`);
}

// Registrar una nueva lectura
export async function crearLectura(lectura) {
  return await solicitarAPI('/lecturas/', {
    method: 'POST',
    body: JSON.stringify(lectura)
  });
}

// Desactivar una lectura
export async function eliminarLectura(id) {
  return await solicitarAPI(`/lecturas/${id}`, {
    method: 'DELETE'
  });
}

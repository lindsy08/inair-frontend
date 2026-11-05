
import { solicitarAPI } from './api.js';

export async function obtenerSensores() {
  return await solicitarAPI('/sensores/');
}

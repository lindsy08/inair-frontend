
import { solicitarAPI } from './api.js';

// Consultar todas las alertas
export async function obtenerAlertas() {
  return await solicitarAPI('/alertas/');
}

// Consultar una alerta específica
export async function obtenerAlertaPorId(id) {
  return await solicitarAPI(`/alertas/${id}`);
}

// Marcar una alerta como atendida
export async function atenderAlerta(id) {
  return await solicitarAPI(`/alertas/${id}/atender`, {
    method: 'PUT'
  });
}

// Desactivar una alerta (solo Administrador)
export async function eliminarAlerta(id) {
  return await solicitarAPI(`/alertas/${id}`, {
    method: 'DELETE'
  });
}

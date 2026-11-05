import { env } from '$env/dynamic/public';

const FASTAPI = (env.PUBLIC_FASTAPI_URL || 'https://api-inair.onrender.com').replace(/\/$/, '');
const EXPRESS = (env.PUBLIC_EXPRESS_URL || '').replace(/\/$/, '');
export const origenAPI = (backend = 'fastapi') => backend === 'express' ? EXPRESS : FASTAPI;
export async function solicitarAPI(ruta, opciones = {}, backend = 'fastapi') {
  const base = origenAPI(backend);
  if (!base) throw new Error('Este módulo requiere configurar PUBLIC_EXPRESS_URL en .env. No se enviaron datos.');
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...opciones.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  let respuesta;
  try { respuesta = await fetch(`${base}${ruta}`, { ...opciones, headers }); }
  catch { throw new Error('No se pudo conectar a la API. Verifica que esté disponible y permita CORS.'); }
  if (respuesta.status === 401) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('token');sessionStorage.removeItem('usuario');sessionStorage.removeItem('modulos');
      window.location.assign('/login');
    }
    throw new Error('La sesión ha vencido o no está autorizada.');
  }
  if (!respuesta.ok) {
    const e = await respuesta.json().catch(() => ({}));
    const detail = e.detail;
    const descripcion = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(x => x.msg || JSON.stringify(x)).join('; ') : e.message;
    throw new Error(descripcion || `Error HTTP ${respuesta.status}. Comprueba el endpoint y los permisos en la documentación de la API.`);
  }
  if (respuesta.status === 204) return null;
  const cuerpo = await respuesta.text();
  if (!cuerpo) return null;
  try { return JSON.parse(cuerpo); } catch { return cuerpo; }
}
export const extraerLista = (data) => {
  if (Array.isArray(data)) return data;
  for (const clave of ['items','data','results','registros','resultados']) if (Array.isArray(data?.[clave])) return data[clave];
  throw new Error('La API no devolvió una lista de registros reconocible.');
};

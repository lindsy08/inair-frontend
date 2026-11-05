import { solicitarAPI, extraerLista } from './api.js';
export async function listarModulo(config) {
 return extraerLista(await solicitarAPI(`${config.endpoint}/`, {}, config.backend));
}
export async function crearModulo(config, datos) {
 return solicitarAPI(`${config.endpoint}/`, { method: 'POST', body: JSON.stringify(datos) }, config.backend);
}
export async function actualizarModulo(config, id, datos) {
 return solicitarAPI(`${config.endpoint}/${id}`, {method:'PUT',body:JSON.stringify(datos)},config.backend);
}
export async function desactivarModulo(config, id) {
 return solicitarAPI(`${config.endpoint}/${id}`,{method:'DELETE'},config.backend);
}
export async function cargarRelacion(relacion) {
 return extraerLista(await solicitarAPI(`${relacion.endpoint}/`, {}, relacion.backend || 'fastapi'));
}

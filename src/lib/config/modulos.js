// Configuración editable del FRONTEND. Los endpoints no probados deben contrastarse
// con /docs del backend correspondiente. El menú de acceso NO sale de este catálogo:
// se lee exclusivamente de los módulos enviados por /auth/login (rolxmodulo).
const campo = (key, label, type = 'text', opts = {}) => ({key,label,type,...opts});
const relacion = (key,label,endpoint,display,opts={}) => campo(key,label,'relation',{endpoint,display,...opts});
export const CONFIG_MODULOS = {
  sedes: {
    titulo:'Sedes educativas',descripcion:'Administración de sedes del proyecto IN-AIR',endpoint:'/sedes',backend:'fastapi',
    campos:[campo('nombre','Nombre de la sede','text',{required:true}),campo('direccion','Dirección'),campo('ciudad','Ciudad'),campo('telefono','Teléfono','tel')],
    columnas:['nombre','direccion','ciudad','estado'],rolesEdicion:['Administrador']
  },
  salones: {
    titulo:'Salones',descripcion:'Ambientes educativos vinculados a las sedes',endpoint:'/salones',backend:'fastapi',
    campos:[relacion('id_sede','Sede educativa','/sedes',['nombre'],{required:true}),campo('nombre','Nombre del salón','text',{required:true}),campo('capacidad','Capacidad','number'),campo('ubicacion','Ubicación')],
    columnas:['nombre','sede','capacidad','estado'],rolesEdicion:['Administrador']
  },
  dispositivos: {
    titulo:'Dispositivos',descripcion:'Equipos de monitoreo de calidad del aire',endpoint:'/dispositivos',backend:'fastapi',
    campos:[relacion('id_salon','Salón','/salones',['nombre'],{required:true}),campo('codigo','Código del equipo','text',{required:true}),campo('modelo','Modelo'),campo('descripcion','Descripción')],
    columnas:['codigo','modelo','salon','estado'],rolesEdicion:['Administrador']
  },
  sensores: {
    titulo:'Sensores',descripcion:'Sensores asociados a los dispositivos de medición',endpoint:'/sensores',backend:'fastapi',
    campos:[relacion('id_dispositivo','Dispositivo','/dispositivos',['codigo','nombre'],{required:true}),campo('tipo','Tipo de sensor','text',{required:true}),campo('unidad','Unidad de medición'),campo('descripcion','Descripción')],
    columnas:['tipo','unidad','dispositivo','estado'],rolesEdicion:['Administrador']
  },
  umbrales: {
    titulo:'Umbrales ambientales',descripcion:'Parámetros para activar alertas automáticas',endpoint:'/umbrales',backend:'fastapi',
    campos:[relacion('id_sensor','Sensor','/sensores',['tipo','nombre'],{required:true}),campo('valor_minimo','Valor mínimo','number'),campo('valor_maximo','Valor máximo','number'),campo('descripcion','Descripción')],
    columnas:['sensor','valor_minimo','valor_maximo','estado'],rolesEdicion:['Administrador']
  },
  acciones: {
    titulo:'Acciones correctivas',descripcion:'Seguimiento a las acciones realizadas frente a una alerta',endpoint:'/acciones',backend:'express',
    campos:[relacion('id_alerta','Alerta','/alertas',['mensaje'],{required:true}),campo('descripcion','Descripción de la acción','textarea',{required:true}),campo('responsable','Responsable'),campo('observaciones','Observaciones','textarea')],
    columnas:['descripcion','responsable','estado','creado'],rolesEdicion:['Técnico','Administrador']
  },
  mantenimientos: {
    titulo:'Mantenimientos',descripcion:'Registro de revisiones y mantenimiento de equipos',endpoint:'/mantenimientos',backend:'express',
    campos:[relacion('id_dispositivo','Dispositivo','/dispositivos',['codigo','nombre'],{required:true}),campo('descripcion','Actividad realizada','textarea',{required:true}),campo('fecha','Fecha','date'),campo('observaciones','Observaciones','textarea')],
    columnas:['descripcion','fecha','estado','creado'],rolesEdicion:['Técnico','Administrador']
  },
  reportes: {
    titulo:'Reportes de ambiente',descripcion:'Reporte de condiciones de los salones por docentes',endpoint:'/reportes',backend:'express',
    campos:[relacion('id_salon','Salón','/salones',['nombre'],{required:true}),campo('descripcion','Descripción del reporte','textarea',{required:true}),campo('observaciones','Observaciones','textarea')],
    columnas:['descripcion','salon','estado','creado'],rolesEdicion:['Docente','Administrador']
  }
};
export const idsInternos = (clave) => clave === 'id' || clave === 'usuario_id' || /^id_/.test(clave);
export function estadoActivo(r) { return ![0,'0',false].includes(r.estado); }
export function campoVisible(clave) {
 const etiquetas = {nombre:'Nombre',codigo:'Código',descripcion:'Descripción',direccion:'Dirección',ciudad:'Ciudad',capacidad:'Capacidad',tipo:'Tipo',unidad:'Unidad',valor:'Valor',valor_minimo:'Mínimo',valor_maximo:'Máximo',modelo:'Modelo',fecha:'Fecha',creado:'Creado',actualizado:'Actualizado',estado:'Estado',observaciones:'Observaciones',responsable:'Responsable',sede:'Sede',salon:'Salón',dispositivo:'Dispositivo',sensor:'Sensor'};
 return etiquetas[clave] || clave.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
}
export function valorParaTabla(registro, clave) {
 if (clave === 'estado') return estadoActivo(registro) ? 'Activo' : 'Inactivo';
 let v=registro[clave];
 if (v && typeof v==='object') v=v.nombre || v.descripcion || v.codigo || v.tipo || 'Registrado';
 if (v == null || v === '') return '—';
 if (typeof v === 'boolean') return v ? 'Sí' : 'No';
 return String(v);
}

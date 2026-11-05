<script>
 import {onMount} from 'svelte';
 import {goto} from '$app/navigation';
 import Header from './Header.svelte';import Card from './Card.svelte';import DataTable from './DataTable.svelte';
 import EstadoMensaje from './EstadoMensaje.svelte';import ResumenIndicador from './ResumenIndicador.svelte';
 import BarraAcciones from './BarraAcciones.svelte';import FormularioDinamico from './FormularioDinamico.svelte';
 import AccionesRegistro from './AccionesRegistro.svelte';import DialogoConfirmacion from './DialogoConfirmacion.svelte';
 import {listarModulo,crearModulo,actualizarModulo,desactivarModulo} from '#lib/services/api_modulo.js';
 import {estadoActivo,campoVisible,valorParaTabla,idsInternos} from '#lib/config/modulos.js';
 let {config,ruta}=$props();
 let registros=$state([]),cargando=$state(true),ocupado=$state(false),error=$state(''),exito=$state(''),edicion=$state(undefined),confirmar=$state(null),tablaVersion=$state(0),rol=$state(''),autorizado=$state(false);
 let puedeEditar=$derived(config.rolesEdicion.includes(rol));
 let columnas=$derived(config.columnas.filter(c=>!idsInternos(c)).map(c=>({campo:c,titulo:campoVisible(c)})));
 let filas=$derived(registros.map(r=>Object.fromEntries(columnas.map(c=>[c.campo,valorParaTabla(r,c.campo)]))));
 let activos=$derived(registros.filter(estadoActivo).length);
 onMount(async()=>{const token=sessionStorage.getItem('token');let modulos=[],usuario={};try{modulos=JSON.parse(sessionStorage.getItem('modulos')||'[]');usuario=JSON.parse(sessionStorage.getItem('usuario')||'{}');}catch{await goto('/login');return;}if(!token){await goto('/login');return;}if(!modulos.some(m=>m.ruta===ruta)){await goto('/panel');return;}autorizado=true;rol=usuario.rol||'';await recargar();});
 async function recargar(){cargando=true;error='';try{registros=await listarModulo(config);tablaVersion+=1;}catch(e){error=e.message;}finally{cargando=false;}}
 async function guardar(datos){if(ocupado)return;ocupado=true;error='';exito='';try{if(edicion){await actualizarModulo(config,edicion.id,datos);exito='Registro actualizado correctamente.';}else{await crearModulo(config,datos);exito='Registro creado correctamente.';}edicion=undefined;await recargar();}catch(e){error=e.message;throw e;}finally{ocupado=false;}}
 async function confirmarBaja(){if(!confirmar||ocupado)return;ocupado=true;error='';exito='';try{await desactivarModulo(config,confirmar.id);exito='Se solicitó la desactivación correctamente.';confirmar=null;await recargar();}catch(e){error=e.message;confirmar=null;}finally{ocupado=false;}}
 function nombre(r){return [r.nombre,r.codigo,r.tipo,r.descripcion].find(v=>typeof v==='string'&&v.trim())||r.correo||'Registro';}
</script>
<Header titulo={config.titulo} subtitulo={config.descripcion}/>
{#if autorizado}
 <div class="resumen"><ResumenIndicador titulo="Registros consultados" valor={registros.length}/><ResumenIndicador titulo="Registros activos" valor={activos}/><ResumenIndicador titulo="Origen de información" valor={config.backend==='express'?'Express':'FastAPI'}/></div>
 <EstadoMensaje texto={error} tipo="error"/><EstadoMensaje texto={exito} tipo="success"/>
 {#if edicion !== undefined && puedeEditar}<Card><FormularioDinamico {config} registro={edicion} {guardar} cancelar={()=>edicion=undefined} {ocupado}/></Card>{/if}
 <Card><BarraAcciones titulo="Registros" actualizar={recargar} {cargando} crear={puedeEditar&&edicion===undefined?()=>edicion=null:null}/>
 {#if cargando}<p role="status">Consultando información de la API…</p>{:else if error&&registros.length===0}<p>Revisa la conexión o el endpoint del módulo. No se han generado registros ficticios.</p>{:else}
 <p class="nota">{registros.length} registros recuperados. Puedes buscar, ordenar y paginar desde la tabla.</p>
 {#key tablaVersion}<DataTable {columnas} {filas}/>{/key}{/if}</Card>
 {#if puedeEditar && !cargando && registros.length>0}<Card><h2>Administrar registros</h2>{#each registros as r,i (r.id??i)}<AccionesRegistro nombre={nombre(r)} activo={estadoActivo(r)} bloqueado={ocupado} editar={()=>{edicion=r;window.scrollTo({top:0,behavior:'smooth'});}} desactivar={()=>confirmar=r}/>{/each}</Card>{/if}
 {#if confirmar}<DialogoConfirmacion titulo="Desactivar registro" detalle={`¿Confirmas la desactivación de ${nombre(confirmar)}? La API debe cambiar estado a 0 y conservar el registro.`} cancelar={()=>confirmar=null} confirmar={confirmarBaja} {ocupado}/>{/if}
{/if}
<style>.resumen{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 22px}.nota{color:#64748b;font-size:13px}.resumen :global(strong){overflow-wrap:anywhere}@media(max-width:680px){.resumen{grid-template-columns:1fr}}h2{color:#1e3a8a;font-size:20px}</style>

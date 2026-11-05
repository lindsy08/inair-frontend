<script>
 import {onMount} from 'svelte';
 import {cargarRelacion} from '#lib/services/api_modulo.js';
 let {campo,valor='',onChange=()=>{},deshabilitado=false}=$props();
 let opciones=$state([]),error=$state(''),cargando=$state(true);
 onMount(async()=>{try{opciones=await cargarRelacion(campo);}catch(e){error=e.message;}finally{cargando=false;}});
 function nombre(r){return campo.display.map(k=>r[k]).filter(v=>v!==undefined && v!==null && v!=='').join(' · ')||r.descripcion||'Registro disponible';}
</script>
<select value={String(valor??'')} onchange={(e)=>onChange(e.currentTarget.value)} required={campo.required} disabled={deshabilitado||cargando||!!error}>
 <option value="">{cargando?'Cargando opciones…':'Selecciona una opción'}</option>
 {#each opciones as opcion (opcion.id)}<option value={String(opcion.id)}>{nombre(opcion)}</option>{/each}
</select>
{#if error}<small class="error">No se pudo cargar {campo.label}: {error}</small>{/if}
<style>select{width:100%;padding:11px;border:1px solid #cbd5e1;border-radius:8px;background:white}.error{display:block;color:#b91c1c;margin-top:5px}</style>

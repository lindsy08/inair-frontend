<script>
 import SelectorRelacion from './SelectorRelacion.svelte';
 import EstadoMensaje from './EstadoMensaje.svelte';
 let {config,registro=null,guardar=()=>{},cancelar=()=>{},ocupado=false}=$props();
 let datos=$state({});let error=$state('');
 $effect(()=>{const current=registro;datos=Object.fromEntries(config.campos.map(c=>[c.key,current?.[c.key]??'']));error='';});
 async function enviar(event){event.preventDefault();error='';const salida={};for(const c of config.campos){const v=datos[c.key];if(c.required&&(v===''||v==null)){error=`Completa ${c.label}.`;return;}if(v===''||v==null){if(c.required)salida[c.key]=null;continue;}salida[c.key]=(c.type==='number'||c.type==='relation')?Number(v):String(v).trim();}try{await guardar(salida)}catch(e){error=e.message||'Error al guardar';}}
</script>
<form onsubmit={enviar}>
 <h2>{registro?'Editar registro':'Nuevo registro'} · {config.titulo}</h2>
 <div class="campos">
 {#each config.campos as campo (campo.key)}
 <div class="control"><label for={`f-${campo.key}`}>{campo.label}{campo.required?' *':''}</label>
 {#if campo.type==='relation'}<SelectorRelacion {campo} valor={datos[campo.key]} onChange={v=>datos[campo.key]=v} deshabilitado={ocupado}/>
 {:else if campo.type==='textarea'}<textarea id={`f-${campo.key}`} rows="3" value={datos[campo.key]??''} oninput={e=>datos[campo.key]=e.currentTarget.value} required={campo.required} disabled={ocupado}></textarea>
 {:else}<input id={`f-${campo.key}`} type={campo.type} step={campo.type==='number'?'any':undefined} value={datos[campo.key]??''} oninput={e=>datos[campo.key]=e.currentTarget.value} required={campo.required} disabled={ocupado}/>{/if}
 </div>{/each}
 </div>
 <EstadoMensaje texto={error} tipo="error"/>
 <div class="acciones"><button type="submit" disabled={ocupado}>{ocupado?'Guardando…':registro?'Guardar cambios':'Registrar'}</button><button type="button" class="sec" onclick={cancelar} disabled={ocupado}>Cancelar</button></div>
 </form>
<style>h2{font-size:20px;color:#1e3a8a;margin:0 0 16px}.campos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.control{min-width:0}.control:has(textarea){grid-column:1/-1}label{display:block;margin-bottom:7px;font-weight:600;color:#334155}input,textarea{box-sizing:border-box;width:100%;padding:11px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}.acciones{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}button{padding:11px 17px;border:0;border-radius:8px;background:#1e3a8a;color:white;cursor:pointer}.sec{background:#e2e8f0;color:#334155}button:disabled{opacity:.5}@media(max-width:650px){.campos{grid-template-columns:1fr}}</style>

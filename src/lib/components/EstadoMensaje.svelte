<script>let {texto='',tipo='info'}=$props();</script>
{#if texto}<p class:fallo={tipo==='error'} class:exito={tipo==='success'} class="mensaje" role={tipo==='error'?'alert':'status'}>{texto}</p>{/if}
<style>.mensaje{padding:12px 16px;border-radius:10px;background:#e8f2fc;color:#1e3a8a;margin:10px 0}.fallo{background:#fff1f2;color:#991b1b}.exito{background:#ecfdf5;color:#166534}</style>

<script>
 import ModuloCrud from '#lib/components/ModuloCrud.svelte';
 import {CONFIG_MODULOS} from '#lib/config/modulos.js';
 const config = CONFIG_MODULOS.salones;
</script>
<svelte:head><title>{config.titulo} | IN-AIR</title></svelte:head>
<ModuloCrud {config} ruta="/salones"/>

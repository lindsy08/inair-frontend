
<script>
  import Header from '#lib/components/Header.svelte';
  import Card from '#lib/components/Card.svelte';
</script>

<svelte:head>
  <title>IN-AIR | Inicio</title>
</svelte:head>

<Header
  titulo="Bienvenido a IN-AIR"
  subtitulo="Sistema de monitoreo de calidad del aire"
/>

<Card>
  <h2>Monitoreo de espacios educativos</h2>

  <p>
    IN-AIR permite consultar las condiciones ambientales
    de los salones mediante sensores ESP32.
  </p>

  <p>
    Desde esta plataforma se podrán consultar lecturas,
    gestionar alertas y realizar seguimiento a las
    condiciones de calidad del aire.
  </p>
</Card>

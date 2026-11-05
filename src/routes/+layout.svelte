
<script>
  import Navbar from '#lib/components/Navbar.svelte';
  import Footer from '#lib/components/Footer.svelte';

  let { children } = $props();
</script>

<div class="contenedor-app">
  <Navbar />

  <main class="contenido">
    {@render children()}
  </main>

  <Footer />
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background-color: #f9fafb;
    color: #1f2937;
  }

  .contenedor-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .contenido {
    flex: 1;
    width: 90%;
    max-width: 960px;
    margin: 24px auto;
  }
</style>


<script>
  import { onMount, tick } from 'svelte';
  import { DataTable } from 'simple-datatables';
  import 'simple-datatables/dist/style.css';

  let {
    columnas = [],
    filas = []
  } = $props();

  let tablaElemento;
  let instancia;

  let filasActuales = $derived(
    filas.map((fila) =>
      columnas.map((columna) =>
        String(fila[columna.campo] ?? '')
      )
    )
  );

  onMount(() => {
    let activo = true;

    async function inicializar() {
      await tick();

      if (!activo || !tablaElemento) return;

      instancia = new DataTable(tablaElemento, {
        searchable: true,
        sortable: true,
        perPage: 10,
        perPageSelect: [5, 10, 20, 50],
        labels: {
          placeholder: 'Buscar...',
          searchTitle: 'Buscar registros',
          perPage: 'registros por página',
          noRows: 'No hay registros',
          info: 'Mostrando {start} a {end} de {rows} registros'
        }
      });
    }

    inicializar();

    return () => {
      activo = false;
      instancia?.destroy();
    };
  });
</script>

<div class="tabla-responsive">
  <table bind:this={tablaElemento}>
    <thead>
      <tr>
        {#each columnas as columna}
          <th>{columna.titulo}</th>
        {/each}
      </tr>
    </thead>

    <tbody>
      {#each filasActuales as fila}
        <tr>
          {#each fila as valor}
            <td>{valor}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .tabla-responsive {
    width: 100%;
    overflow-x: auto;
  }
</style>

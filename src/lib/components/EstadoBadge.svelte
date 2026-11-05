<script>let {activo=true}=$props();</script>
<span class:ok={activo} class="pill">{activo?'Activo':'Inactivo'}</span>
<style>.pill{display:inline-block;padding:5px 10px;border-radius:20px;background:#fee2e2;color:#991b1b;font-weight:650;font-size:12px}.ok{background:#dcfce7;color:#166534}</style>

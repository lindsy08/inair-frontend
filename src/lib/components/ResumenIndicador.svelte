<script>let {titulo='',valor='—',descripcion=''}=$props();</script>
<div class="metric"><small>{titulo}</small><strong>{valor}</strong>{#if descripcion}<span>{descripcion}</span>{/if}</div>
<style>.metric{border:1px solid #dbe4eb;border-radius:12px;background:#fff;padding:16px;display:flex;flex-direction:column;gap:6px}.metric small{color:#64748b;font-weight:600}.metric strong{font-size:28px;color:#1e3a8a}.metric span{color:#64748b;font-size:12px}</style>

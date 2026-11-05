# IN-AIR frontend en Render

**Tipo:** Web Service (NO Static Site)
**Language:** Node
**Build Command:** `npm install && npm run build`
**Start Command:** `node build/index.js`
**Node:** 22.x (`.node-version`)
**Root Directory:** vacío si subiste `inair-frontend` como raíz de repositorio; `inair-frontend` si subiste la carpeta contenedora completa.

## Variables de entorno
`PUBLIC_FASTAPI_URL=https://api-inair.onrender.com`
`PUBLIC_EXPRESS_URL=https://TU-EXPRESS.onrender.com` (reemplazar por URL real).
No subir `.env` con credenciales.

## Publicación
1. Descomprime y sube el contenido de `inair-frontend` a un repositorio GitHub.
2. Render Dashboard -> New -> Web Service -> conecta el repositorio.
3. Configura Node, comandos anteriores y variables de entorno.
4. Deploy. Abre la URL pública y prueba login, Usuarios, Lecturas, Alertas y los demás módulos.
5. Si CORS falla, solicita en FastAPI/Express permitir el origen exacto `https://<servicio>.onrender.com`.

**Nota:** esta variante agrega el adaptador Node necesario para Render. No certifica un despliegue ni conexión real con Express. El lock anterior fue omitido para evitar que quede incongruente después de cambiar de adaptador; `npm install` generará uno nuevo.

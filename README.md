# Geo-AR Carrera

Juego de carrera con **realidad aumentada y geolocalización** hecho con
[A-Frame](https://aframe.io/) y [AR.js](https://github.com/AR-js-org/AR.js).

Al caminar, aparecen puntos en el mapa. Cuando el usuario está a menos de
15 metros de un punto, el balizador cian se convierte en un objeto rojo
que se puede tocar para leer la pista.

## Demo

GitHub Pages: https://parraromerojulian36-ui.github.io/PruebaCarrea/

> La cámara y el GPS solo funcionan en **HTTPS** (o localhost) y en un
> dispositivo móvil. En escritorio la cámara funciona, pero la orientación
> y el GPS suelen no estar disponibles.

## Cómo ejecutarlo en local

El navegador bloquea `fetch('data.json')` desde `file://`, así que levanta
un servidor estático:

```bash
# Con Python
python -m http.server 8000

# O con Node
npx serve .
```

Luego abre `http://localhost:8000`. Para probar el GPS en un móvil real,
usa un túnel HTTPS (`npx localtunnel --port 8000`) o súbelo a GitHub Pages.

## Estructura

```
index.html    Escena A-Frame + AR.js
style.css     Interfaz (barra de estado y caja de información)
main.js       Carga de puntos, distancia y detección de proximidad
data.json     Lista de puntos: id, lat, lon, title, info
.nojekyll     Evita el procesado de Jekyll en GitHub Pages
```

## Añadir o editar puntos

Edita `data.json`:

```json
{
  "id": "punto-3",
  "lat": 4.123456,
  "lon": -74.123456,
  "title": "Nombre del lugar",
  "info": "Texto que aparece al descubrir el punto."
}
```

## Desplegar en GitHub Pages

1. Sube los cambios a la rama `main`.
2. Ve a **Settings → Pages**.
3. En *Build and deployment* elige **Deploy from a branch**.
4. Selecciona la rama `main` y la carpeta `/ (root)` y guarda.
5. En unos minutos estará en `https://<usuario>.github.io/<repositorio>/`.

## Notas

- AR.js está fijado a `3.4.8` desde jsDelivr para evitar que un cambio en
  `master` rompa el proyecto.
- Los antiguos modelos `.glb` (`cofre`, `Parca`, `Torre`, ~96 MB) no se
  usaban y se eliminaron. Si quieres usarlos, comprímelos antes
  (Draco / `gltf-transform`) y cárgalos con `gltf-model`.

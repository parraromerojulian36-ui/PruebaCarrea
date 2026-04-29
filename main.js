// Cargar los puntos desde el archivo JSON
async function iniciarJuego() {
    const respuesta = await fetch('data.json');
    const puntos = await respuesta.json();
    const scene = document.querySelector('a-scene');

    puntos.forEach(punto => {
        // Crear entidad principal
        const entity = document.createElement('a-entity');
        entity.setAttribute('id', punto.id);
        entity.setAttribute('class', 'clickable');
        entity.setAttribute('gps-entity-place', `latitude: ${punto.lat}; longitude: ${punto.lon};`);

        // Crear Beacon y Objeto
        entity.innerHTML = `
            <a-entity id="beacon-${punto.id}">
                <a-cylinder color="#00FFFF" height="300" radius="0.5" 
                            material="opacity: 0.6; transparent: true; shader: flat;" 
                            position="0 150 0"></a-cylinder>
            </a-entity>
            <a-box id="objeto-${punto.id}" color="#FF4444" scale="3 3 3" 
                   position="0 1.5 0" visible="false"></a-box>
        `;

        scene.appendChild(entity);

        // Click event
        entity.addEventListener('click', () => {
            const obj = document.getElementById(`objeto-${punto.id}`);
            if(obj.getAttribute('visible') === 'true') {
                document.getElementById('info-title').textContent = punto.title;
                document.getElementById('info-text').textContent = punto.info;
                document.getElementById('info-box').style.display = 'block';
            }
        });
    });

    iniciarLogicaProximidad(puntos);
}

// Lógica de distancia
function iniciarLogicaProximidad(puntos) {
    setInterval(() => {
        const camera = document.querySelector('a-camera').components['gps-camera'];
        if (camera && camera.currentCoords) {
            const user = camera.currentCoords;
            puntos.forEach(p => {
                const dist = calcularDistancia(user.latitude, user.longitude, p.lat, p.lon);
                const beacon = document.getElementById(`beacon-${p.id}`);
                const objeto = document.getElementById(`objeto-${p.id}`);

                if (dist < 15) {
                    beacon.setAttribute('visible', 'false');
                    objeto.setAttribute('visible', 'true');
                } else {
                    beacon.setAttribute('visible', 'true');
                    objeto.setAttribute('visible', 'false');
                }
            });
        }
    }, 2000);
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

iniciarJuego();
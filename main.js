(function () {
    'use strict';

    var CONFIG = {
        discoveryRadius: 15
    };

    var scene = document.querySelector('a-scene');
    var statusBar = document.getElementById('status-bar');
    var infoBox = document.getElementById('info-box');
    var infoTitle = document.getElementById('info-title');
    var infoText = document.getElementById('info-text');

    function setStatus(message) {
        statusBar.textContent = message;
        statusBar.style.display = message ? 'block' : 'none';
    }

    function showInfo(punto) {
        infoTitle.textContent = punto.title;
        infoText.textContent = punto.info;
        infoBox.style.display = 'block';
    }

    function hideInfo() {
        infoBox.style.display = 'none';
    }

    function calcularDistancia(lat1, lon1, lat2, lon2) {
        var R = 6371e3;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function cargarPuntos() {
        return fetch('data.json', { cache: 'no-store' }).then(function (respuesta) {
            if (!respuesta.ok) {
                throw new Error('HTTP ' + respuesta.status);
            }
            return respuesta.json();
        }).then(function (puntos) {
            if (!Array.isArray(puntos)) {
                throw new Error('data.json no contiene una lista de puntos');
            }
            return puntos;
        });
    }

    function crearPunto(punto) {
        var estado = { descubierto: false };

        var entidad = document.createElement('a-entity');
        entidad.setAttribute('id', punto.id);
        entidad.setAttribute('class', 'clickable');
        entidad.setAttribute('gps-entity-place',
            'latitude: ' + punto.lat + '; longitude: ' + punto.lon + ';');

        var beacon = document.createElement('a-cylinder');
        beacon.setAttribute('id', 'beacon-' + punto.id);
        beacon.setAttribute('color', '#00FFFF');
        beacon.setAttribute('height', '300');
        beacon.setAttribute('radius', '0.5');
        beacon.setAttribute('position', '0 150 0');
        beacon.setAttribute('material',
            'opacity: 0.6; transparent: true; shader: flat;');

        var objeto = document.createElement('a-box');
        objeto.setAttribute('id', 'objeto-' + punto.id);
        objeto.setAttribute('color', '#FF4444');
        objeto.setAttribute('scale', '3 3 3');
        objeto.setAttribute('position', '0 1.5 0');
        objeto.setAttribute('visible', 'false');

        entidad.appendChild(beacon);
        entidad.appendChild(objeto);

        entidad.addEventListener('click', function () {
            if (estado.descubierto) {
                showInfo(punto);
            } else {
                setStatus('Acercate a "' + punto.title + '" para descubrirlo');
            }
        });

        return { punto: punto, entidad: entidad, beacon: beacon, objeto: objeto, estado: estado };
    }

    function actualizarProximidad(refs, latitude, longitude) {
        refs.forEach(function (ref) {
            var distancia = calcularDistancia(latitude, longitude, ref.punto.lat, ref.punto.lon);
            var cerca = distancia < CONFIG.discoveryRadius;

            ref.estado.descubierto = cerca;
            ref.objeto.setAttribute('visible', cerca);
            ref.beacon.setAttribute('visible', !cerca);
        });
    }

    function iniciar() {
        var camera = document.querySelector('[gps-camera]');
        if (!camera) {
            setStatus('No se encontro la camara GPS de AR.js');
            return;
        }

        var refs = [];
        var recibioPosicion = false;
        var timeoutId = window.setTimeout(function () {
            if (!recibioPosicion) {
                setStatus('Aun no se obtiene el GPS. Sal al exterior y permite la ubicacion.');
            }
        }, 15000);

        camera.addEventListener('gps-camera-update-position', function (e) {
            recibioPosicion = true;
            window.clearTimeout(timeoutId);
            setStatus('');
            actualizarProximidad(refs, e.detail.position.latitude, e.detail.position.longitude);
        });

        cargarPuntos().then(function (puntos) {
            refs = puntos.map(crearPunto);
            refs.forEach(function (ref) {
                scene.appendChild(ref.entidad);
            });
            setStatus('Buscando tu ubicacion...');
        }).catch(function () {
            setStatus('No se pudieron cargar los puntos (data.json).');
        });
    }

    document.getElementById('info-close').addEventListener('click', hideInfo);

    if (scene.hasLoaded) {
        iniciar();
    } else {
        scene.addEventListener('loaded', iniciar);
    }
})();

const selectProvincia = document.querySelector('select#provincia');
const selectLocalidad = document.querySelector('select#localidad');

// Variables globales
var nombreProvincia, data;

document.addEventListener('DOMContentLoaded', () => {

    initChangeProvincia();
    initChangeLocalidad();

});

// Inicializar el cambio de Provincia
function initChangeProvincia() {
    if (selectProvincia) {
        selectProvincia.onchange = function (e) { return handleChangeProvincia(this, e); }
    }
}

// Manejar el cambio de Provincia
function handleChangeProvincia(selectObj, objEvent) {
    if (selectLocalidad) {
        // Solo se habilitará cuando el índice seleccionado sea distinto de cero
        selectLocalidad.disabled = true;
        // Removemos opciones si las hay
        removeOptions(selectLocalidad);
        // Removemos datos de salida, si los hay
        output('');
        const selectedIndex = selectObj.selectedIndex;
        if (selectedIndex > 0) {
            const value = selectObj.options[selectedIndex].value;
            if (validCharacter(value)) {
                // Obtenemos el nombre de la Provincia para la muestra
                nombreProvincia = selectObj.options[selectedIndex].textContent;
                // Habilitamos el select de localidades
                selectLocalidad.disabled = false;
                const url = 'server_processing.php';
                const formData = "provincia=" + encodeURIComponent(value);
                // Solicitar datos al servidor
                sendHttpRequest('POST', url, formData, loadLocalities);
            }
        }
    }
}

// Cargar las localidades
function loadLocalities(response) {
    // Parseamos la respuesta del servidor
    data = JSON.parse(response);
    createOptions(data, selectLocalidad);
}

// Inicializar el cambio de Localidad
function initChangeLocalidad() {
    if (selectLocalidad) {
        // En la carga del DOM desabilitamos el select de localidad
        selectLocalidad.disabled = true;
        selectLocalidad.onchange = function (e) { return handleChangeLocalidad(this, e); }
    }
}

// Manejar el cambio de Localidad
function handleChangeLocalidad(selectObj, objEvent) {
    const selectedIndex = selectObj.selectedIndex;
    let message = '';
    if (selectedIndex > 0) {
        const obj = data[selectedIndex - 1];
        message += `<div class="output"><h2>${obj.nombre}, ${nombreProvincia}</h2><h3>Código postal: ${obj.cp}</h3></div>`;
    }
    // Mostrar datos
    output(message);
}

// Crea opciones en objetos select
function createOptions(data, selectObj) {
    let newOpt;
    const fragment = document.createDocumentFragment();
    data.forEach(obj => {
        newOpt = document.createElement('option');
        newOpt.value = obj.id;
        newOpt.text = obj.nombre + " (" + obj.cp + ")";
        try {
            fragment.add(newOpt);
        } catch (error) {
            fragment.appendChild(newOpt);
        }
    });
    selectObj.appendChild(fragment);
}

// Remueve todas las opciones excepto el índice 0 (osea no remueve la primera opción)
function removeOptions(selectObj) {
    let len = selectObj.options.length;
    while (len-- > 1) selectObj.remove(1);
}

// Datos de salida
function output(message) {
    const output = document.querySelector('#output');
    if (output) output.innerHTML = message;
}

// Enviar solicitud al servidor
function sendHttpRequest(method, url, data, callback) {
    const xhr = getXhr();
    xhr.onreadystatechange = processRequest;
    function getXhr() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    function processRequest() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if (xhr.status == 200) {
                if (callback) callback(xhr.responseText);
            }
        }
    }
    xhr.open(method, url + ((/\?/).test(url) ? "&" : "?") + (new Date()).getTime());
    if (data && !(data instanceof FormData)) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(data);
}

// Validamos el caracter que forma parte del código 33166-2
function validCharacter(c) {
    // Letras mayúsculas, no minúsculas
    const re = /^[ABCDEFGHJKLMNPQRSTUVWXYZ]{1}$/; // No incluidas => I,Ñ,O
    return re.test(c);
}
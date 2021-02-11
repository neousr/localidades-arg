<?php

/**
 * Este archivo se debe ejecutar de forma independiente para capturar
 * todas las localidades por provincia para Argentina en formato csv
 */

error_reporting(E_ALL | E_STRICT);
mb_internal_encoding('UTF-8');

$time = microtime(true);

$provincias = [
    'A' => 'Salta',
    'B' => 'Buenos Aires',
    'C' => 'Ciudad Autónoma de Buenos Aires',
    'D' => 'San Luis',
    'E' => 'Entre Ríos',
    'F' => 'La Rioja',
    'G' => 'Santiago del Estero',
    'H' => 'Chaco',
    'J' => 'San Juan',
    'K' => 'Catamarca',
    'L' => 'La Pampa',
    'M' => 'Mendoza',
    'N' => 'Misiones',
    'P' => 'Formosa',
    'Q' => 'Neuquén',
    'R' => 'Río Negro',
    'S' => 'Santa Fe',
    'T' => 'Tucumán',
    'U' => 'Chubut',
    'V' => 'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
    'W' => 'Corrientes',
    'X' => 'Córdoba',
    'Y' => 'Jujuy',
    'Z' => 'Santa Cruz'
];

define('DOCUMENT_ROOT', str_replace('\\', '/', dirname(__FILE__)) . '/por-provincia-csv/');

/**
 * Siempre eliminará la carpeta por-provincia y todos los archivos json que contiene
 */
if (file_exists(DOCUMENT_ROOT)) {
    $files = scandir(DOCUMENT_ROOT);
    if ( count($files) > 2 ) {
        // Removemos todos los .csv
        array_map('unlink', glob(DOCUMENT_ROOT . '*.csv'));
    }
    // Removemos el directorio
    rmdir(DOCUMENT_ROOT);
}

// Creamos el directorio
mkdir(DOCUMENT_ROOT);

foreach ($provincias as $key => $value) {
    $curlData = 'action=localidades&localidad=none&calle=&altura=&provincia=' . $key;
    $response = '{"iso_31662":"AR-' . $key . '","provincia":"'. $provincias[$key] . '","localidades":';
    // https://www.php.net/manual/es/function.curl-setopt.php
    $options = [
        // CURLOPT_HTTPHEADER Un array de campos a configurar para el header HTTP, en el formato: array('Content-type: text/plain', 'Content-length: 100')
        CURLOPT_HTTPHEADER => [
            "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:85.0) Gecko/20100101 Firefox/85.0",
            "Accept: application/json, text/javascript, */*; q=0.01",
            "Accept-Language: es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3",
            "Content-Type: application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With: XMLHttpRequest"
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_POST => 1,
        // Si pasamos un array a CURLOPT_POSTFIELDS codificará los datos como multipart/form-data, 
        // pero si pasamos una cadena URL-encoded codificará los datos como application/x-www-form-urlencoded. 
        CURLOPT_POSTFIELDS => $curlData,
        CURLOPT_VERBOSE => 1
    ];
    
    $url = 'https://www.correoargentino.com.ar/sites/all/modules/custom/ca_forms/api/wsFacade.php';
    $curl = curl_init($url);
    curl_setopt_array($curl, $options);
    // https://www.iteramos.com/pregunta/31833/php-como-quitar-todos-los-no-imprimibles-de-caracteres-en-una-cadena
    $response .= preg_replace('/[^[:print:]]/', '', curl_exec($curl)) . '}';
    curl_close($curl);

    $data = json_decode($response, true);

    // id_localidad|nombre_localidad|código_postal
    $fp = fopen(DOCUMENT_ROOT . $provincias[$key] . '.csv', 'w');
    foreach ($data['localidades'] as $campos) {
        fputcsv($fp, $campos);
    }
    fclose($fp);
}

$time = microtime(true) - $time;
echo "<p>Tiempo total de ejecución: " . round($time, 3) . " segundos.";
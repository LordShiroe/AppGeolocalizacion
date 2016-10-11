# AppGeolocalizacion
Repositorio con la Información de la App de Geolocalización

Se requiere la api 17 y la api 23 del SDK de Android.
Se requiere npm.

- Instala Cordova (requiere haber instalado Node.js)
npm install -g cordova

- Instalar Ionic
npm install -g ionic

- Crear un proyecto de Ionic en blanco y copiar los archivos.

cd {carpeta_del_proyecto}
ionic start geolocalizacion blank
cd geolocalizacion
ionic platform add android
ionic build android

- Instalar ngCordova
bower install ngCordova

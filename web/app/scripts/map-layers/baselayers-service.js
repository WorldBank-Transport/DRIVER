(function () {
    'use strict';

    /* Service for sharing baselayer configuration.
     */

    function BaseLayersService() {

        var module = {
            streets: streets,
            satellite: satellite,
            baseLayers: baseLayers
        };
        return module;

        function streets() {
            var layer = new L.tileLayer(
                'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
                    detectRetina: false,
                    zIndex: 1
                }
            );
            return layer;
        }

        function satellite() {
            var layer = new L.tileLayer(
                '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                {
                    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                    detectRetina: false,
                    zIndex: 1
                }            );
            return layer;
        }

        function baseLayers() {
            return [
                { label: 'Streets', layer: streets() },
                { label: 'Satellite', layer: satellite() },
            ];
        }
    }

    angular.module('driver.map-layers')
    .factory('BaseLayersService', BaseLayersService);
})();

/**
 * Map state control - hangs on to drawn items for consistent map state across navigation
 */
(function () {
    'use strict';

    /* ngInject */
    function MapState($log) {
        var filterGeoJSON, zoom, location;
        var svc = {
            setFilterGeoJSON: setFilterGeoJSON,
            getFilterGeoJSON: getFilterGeoJSON,
            setZoom: setZoom,
            getZoom: getZoom,
            setLocation: setLocation,
            getLocation: getLocation
        };

        return svc;

        /**
         * Set filter geojson
         * @param {object} geojson for a filter
         */
        function setFilterGeoJSON(geojson) {
            $log.debug('Setting drawn layer');
            filterGeoJSON = geojson;
            return;
        }

        /**
         * Get filter geojson
         */
        function getFilterGeoJSON() {
            $log.debug('Getting stored drawn layer...');
            return filterGeoJSON;
        }

        /**
         * Set zoomlevel
         * @param {number} mapZoom The zoom level of the leaflet map
         */
        function setZoom(mapZoom) {
            $log.debug('Setting zoom to: ' + JSON.stringify(mapZoom));
            zoom = mapZoom;
        }

        /**
         * Get zoomlevel
         */
        function getZoom() {
            $log.debug('Getting stored map zoom...');
            return zoom;
        }

        /**
         * Set coordinates for the center of the map
         * @param {object} mapLocation a leaflet lat/lng object
         */
        function setLocation(mapLocation) {
            $log.debug('Setting location to: ' + JSON.stringify(mapLocation));
            location = mapLocation;
            return;
        }

        /**
         * Get coordinates for the center of the map
         */
        function getLocation() {
            $log.debug('Getting stored map location...');
            return location;

        }

    }

    angular.module('driver.state')
    .factory('MapState', MapState);
})();

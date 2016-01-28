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
            filterGeoJSON = geojson;
        }

        /**
         * Get filter geojson
         */
        function getFilterGeoJSON() {
            return filterGeoJSON;
        }

        /**
         * Set zoomlevel
         * @param {number} mapZoom The zoom level of the leaflet map
         */
        function setZoom(mapZoom) {
            zoom = mapZoom;
        }

        /**
         * Get zoomlevel - default to 5
         */
        function getZoom() {
            return zoom || 5;
        }

        /**
         * Set coordinates for the center of the map
         * @param {object} mapLocation a leaflet lat/lng object
         */
        function setLocation(mapLocation) {
            location = mapLocation;
        }

        /**
         * Get coordinates for the center of the map
         */
        function getLocation() {
            return location;

        }

    }

    angular.module('driver.state')
    .factory('MapState', MapState);
})();

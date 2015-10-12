(function () {
    'use strict';

    var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

    /* ngInject */
    function EmbedMapController($log, $scope, $rootScope) {
        var ctl = this;

        ctl.isEditable = false;
        ctl.map = null;
        ctl.locationMarker = null;

        /*
         * Initialize map and listen for click events, if editable.
         *
         * @param {Object} leafletMap Map object returned from intialized leaflet directive
         * @param {Boolean} isEditable If set to true, update and broadcast marker location on click
         * @param {Double} lat If set, initial latitude for marker
         * @param {Double} lng If set, initial longitude for marker
         */
        ctl.setUpMap = function(leafletMap, isEditable, lat, lng) {
            ctl.map = leafletMap;
            ctl.isEditable = !!isEditable;

            var streets = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                                          {attribution: cartoDBAttribution});
            ctl.map.addLayer(streets, {detectRetina: true});

            if (ctl.isEditable) {
                ctl.map.on('click', function(e) {
                    broadcastCoordinates(e.latlng);
                    setMarker(e.latlng);
                });
                ctl.map.on('moveend', function(e) {
                    broadcastBBox(e.target.getBounds());
                });
            }

            if (lat && lng) {
                setMarker(L.latLng(lat, lng));
            }
        };

        /** Set marker location, or create marker at location if it does not exist yet.
         *
         * @param {Object} latlng Leaflet LatLng object with coordinates for marker
         */
        function setMarker(latlng) {
            if (ctl.locationMarker) {
                ctl.locationMarker.setLatLng(latlng);
            } else {
                ctl.locationMarker = new L.marker(latlng, {draggable: ctl.isEditable}).addTo(ctl.map);

                if (ctl.isEditable) {
                    ctl.locationMarker.on('dragend', function() {
                        broadcastCoordinates(ctl.locationMarker.getLatLng());
                    });
                }

                // pan/zoom to marker on add
                ctl.map.setView(latlng, 11, {animate: true});
            }
        }

        /** Tell add-edit-controller.js about bbox
         *
         * @param {Object} bbox Leaflet LatLngBounds object with map's bounds
         */
        function broadcastBBox(bbox) {
            $rootScope.$broadcast('driver.views.record:map-moved', [bbox.getWest(), bbox.getNorth(),
                                                                    bbox.getEast(), bbox.getSouth()]);
        }

        /** Tell add-edit-controller.js when marker point set.
         *
         * @param {Object} latlng Leaflet LatLng object with marker's coordinates
         */
        function broadcastCoordinates(latlng) {
            if (!ctl.isEditable) {
                $log.error('Attempting to broadcast marker coordinates on non-editable map');
                return;
            }
            $rootScope.$broadcast('driver.views.record:marker-moved', [latlng.lng, latlng.lat]);
        }

        $scope.$on('driver.views.record:location-selected', function(event, data, recenter) {
            var latlng = L.latLng(data.lat, data.lng);
            setMarker(latlng);
            if (recenter) {
                ctl.map.setView(latlng, 11, {animate: true});
            }
        });

        // destroy map state when record is closed
        $scope.$on('driver.views.record:close', function() {
            ctl.map = null;
            ctl.locationMarker = null;
        });

        return ctl;
    }

    angular.module('driver.views.record')
    .controller('embedMapController', EmbedMapController);

})();

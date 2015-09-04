(function () {
    'use strict';

    var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

    /* ngInject */
    function EmbedMapController($log, $scope, $rootScope) {
        var ctl = this;

        ctl.map = null;

        var locationMarker = null;

        /*
         * Initialize map with baselayer and listen for click events
         */
        ctl.setUpMap = function(leafletMap) {
            ctl.map = leafletMap;
            var streets = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                                          {attribution: cartoDBAttribution});
            ctl.map.addLayer(streets, {detectRetina: true});

            ctl.map.on('click', function(e) {
                broadcastCoordinates(e.latlng);
                setMarker(e.latlng);
            });
        }

        // set marker location, or create marker at location if it does not exist yet
        function setMarker(latlng) {
            if (locationMarker) {
                locationMarker.setLatLng(latlng);
            } else {
                locationMarker = new L.marker(latlng, {draggable: true}).addTo(ctl.map);
                locationMarker.on('dragend', function() {
                    broadcastCoordinates(locationMarker.getLatLng());
                });

                // pan/zoom to marker on add
                ctl.map.setView(latlng, 9, {animate: true});
            }
        }

        // tell add-edit-controller.js when marker point set
        function broadcastCoordinates(latlng) {
            $rootScope.$broadcast('driver.views.record:marker-moved', [latlng.lng, latlng.lat]);
        }

        $scope.$on('driver.views.record:location-selected', function(event, data) {
            setMarker(L.latLng(data.lat, data.lng));
        });

        // destroy map state when record is closed
        $scope.$on('driver.views.record:close', function() {
            ctl.map = null;
            locationMarker = null;
        });

        return ctl;
    }

    angular.module('driver.views.record')
    .controller('embedMapController', EmbedMapController);

})();

(function () {
    'use strict';

    var stamenTonerAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.';

    function driverEmbedMap() {

        var locationMarker = null;
        var scope = null;

        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            require: 'leafletMap',
            link: link
        };
        return module;

        function link(linkScope, element, attrs, controller) {
            scope = linkScope;
            controller.getMap().then(setUpMap);
        }

        function broadcastCoordinates(latlng) {
            scope.$parent.$broadcast('Map:LocationSelected', [latlng.lat, latlng.lng]);
        }

        function setUpMap(map) {
            var streets = new L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
                                          {attribution: stamenTonerAttribution});
            map.addLayer(streets, {detectRetina: true});

            map.on('click', function(e) {

                broadcastCoordinates(e.latlng);

                if (locationMarker) {
                    locationMarker.setLatLng(e.latlng);
                } else {
                    locationMarker = new L.marker(e.latlng, {draggable: true}).addTo(map);
                    locationMarker.on('dragend', function() {
                        broadcastCoordinates(locationMarker.getLatLng());
                    });
                }
            });
        }
    }

    angular.module('driver.views.record')
        .directive('driverEmbedMap', driverEmbedMap);

})();

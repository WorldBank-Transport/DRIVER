(function () {
    'use strict';

    var stamenTonerAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.';

    function driverEmbedMap() {
        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            require: 'leafletMap',
            link: link
        };
        return module;

        var locationMarker = null;
        var location = null;

        function link(scope, element, attrs, controller) {
            controller.getMap().then(setRecordLayers);
        }

        function setRecordLayers(map) {
            var streets = new L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
                                          {attribution: stamenTonerAttribution});
            map.addLayer(streets, {detectRetina: true});

            map.on('click', function(e) {
                location = [e.latlng.lat, e.latlng.lng];
                if (locationMarker) {
                    locationMarker.setLatLng(e.latlng);
                } else {
                    locationMarker = new L.marker(e.latlng, {draggable: true}).addTo(map);
                    locationMarker.on('dragend', function(e) {
                        var latlng = locationMarker.getLatLng();
                        location = [latlng.lat, latlng.lng];
                    });
                }
            });
        }
    }

    angular.module('driver.views.record')
        .directive('driverEmbedMap', driverEmbedMap);

})();

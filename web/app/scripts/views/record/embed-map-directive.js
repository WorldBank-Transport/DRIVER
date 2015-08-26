(function () {
    'use strict';

    var stamenTonerAttribution = 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.';

    function driverEmbedMap(Config) {
        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            require: 'leafletMap',
            link: link
        };
        return module;

        function link(scope, element, attrs, controller) {
            controller.getMap().then(setRecordLayers);
        }

        function setRecordLayers(map) {
            var streets = new L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
                                          {attribution: stamenTonerAttribution});
            map.addLayer(streets, {detectRetina: true});
        }
    }

    angular.module('driver.views.record')
        .directive('driverEmbedMap', driverEmbedMap);

})();

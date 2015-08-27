(function () {
    'use strict';

    var cartoDBAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

    function driverBaseLayers(Config) {
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
            var streets = new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                                          {attribution: cartoDBAttribution});
            map.addLayer(streets, {detectRetina: true});

            // Change 'ALL' for a record type UUID to filter layer
            var windLayer = new L.tileLayer(Config.windshaft.hostname + '/tiles/recordtype/ALL/{z}/{x}/{y}.png',
                                            {attribution: 'PRS'});
            map.addLayer(windLayer, {detectRetina: true});
        }
    }

    angular.module('driver.views.map')
        .directive('driverBaseLayers', driverBaseLayers);

})();

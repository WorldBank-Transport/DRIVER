(function () {
    'use strict';

    function driverBaseLayers(Records) {
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
            var streets = new L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png');

            map.addLayer(streets);
            // TODO: Remove; this is just a stub to have something to look at
            Records.query({}).$promise.then(function(results) {
                _.forEach(results, function(rec) {
                    map.addLayer(L.marker([rec.geom.coordinates[1], rec.geom.coordinates[0]],
                            {clickable: false}));
                });
            });
        }

    }

    angular.module('driver.views.map')
        .directive('driverBaseLayers', driverBaseLayers);

})();

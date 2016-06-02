(function () {
    'use strict';

    function driverMapLayers() {
        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            controller: 'driverLayersController',
            require: ['leafletMap', 'driver-map-layers'],
            link: link
        };
        return module;

        function link(scope, element, attrs, controllers) {
            var leafletController = controllers[0];
            var controller = controllers[1];

            leafletController.getMap().then(controller.initLayers);
        }
    }

    angular.module('driver.views.map')
        .directive('driverMapLayers', driverMapLayers);

})();

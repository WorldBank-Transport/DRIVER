(function() {
    'use strict';

    /* ngInject */
    function BlackSpots(InitialState) {

        var module = {
            restrict: 'A',
            scope: false,
            replace: true,
            controller: 'BlackSpotsController',
            require: ['leafletMap', 'driver-black-spots'],
            link: link
        };
        return module;

        function link(scope, element, attrs, controllers) {
            InitialState.ready().then(function() {
                var leafletController = controllers[0];
                var controller = controllers[1];
                controller.initMap(leafletController);
            });
        }

    }

    angular.module('driver.blackSpots')
        .directive('driverBlackSpots', BlackSpots);

})();

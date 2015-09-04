(function () {
    'use strict';

    function driverEmbedMap() {

        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            controller: 'embedMapController',
            require: ['leafletMap', 'driver-embed-map'],
            link: link
        };
        return module;

        function link(linkScope, element, attrs, controllers) {

            var leafletController = controllers[0];
            var controller = controllers[1];

            leafletController.getMap().then(function(map) {
                controller.setUpMap(map, attrs.editable, attrs.lat, attrs.lng);
            });
        }
    }

    angular.module('driver.views.record')
        .directive('driverEmbedMap', driverEmbedMap);

})();

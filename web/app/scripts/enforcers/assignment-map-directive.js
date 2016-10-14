(function() {
    'use strict';

    /* ngInject */
    function AssignmentMap($timeout, InitialState, LeafletDefaults, BaseLayersService) {

        var module = {
            restrict: 'A',
            scope: false,
            replace: true,
            controller: 'AssignmentMapController',
            require: ['leaflet-map', 'assignmentMap'],
            link: link
        };
        return module;

        function link(scope, element, attrs, controllers) {
            InitialState.ready().then(function() {
                var leafletController = controllers[0];
                var geom = scope.$eval(attrs.geom);
                var assignmentBoundary = L.polygon(swapCoords(geom));
                leafletController.getMap()
                    .then(function(map) {
                        initMap(map, assignmentBoundary);
                    });
            });
        }

        function initMap(map, assignment) {
            addBaseLayers(map);
            zoomToAssignment(map, assignment);
        }

        function addBaseLayers(map) {
            var baseMaps = BaseLayersService.baseLayers();
            map.addLayer(baseMaps[0].layer);

            return map;
        }

        function zoomToAssignment(map, assignmentBoundary) {
            map.addLayer(assignmentBoundary);
            map.fitBounds(assignmentBoundary.getBounds());
            return map;
        }

        /** Recursively swap the coordinates in a nested array of coordinates, as for Leaflet
         * polygons or multipolygons
         */
        function swapCoords(toSwap) {
            if (toSwap.length === 2) {
                var temp = toSwap[0];
                toSwap[0] = toSwap[1];
                toSwap[1] = temp;
            } else {
                angular.forEach(toSwap, swapCoords);
            }
            return toSwap;
        }

    }

    angular.module('driver.enforcers')
        .directive('assignmentMap', AssignmentMap);

})();


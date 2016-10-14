(function () {
    'use strict';

    /* ngInject */
    function zoomToBoundary(BoundaryState, LeafletDefaults) {
        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            controller: '',
            require: 'leafletMap',
            link: link
        };
        var mapDefaults = LeafletDefaults.get();
        return module;

        function link(scope, element, attrs, controller) {
            // Re-zoom the map when boundary is changed
            scope.$on('driver.state.boundarystate:selected', function() {
                controller.getMap().then(zoomToSelected);
            });
        }

        function zoomToSelected(map) {
            BoundaryState.getSelected().then(function(selected) {
                if (!selected.bbox) {
                    map.setZoom(mapDefaults.zoom);
                    map.panTo(mapDefaults.center);
                } else {
                    map.fitBounds(selected.bbox);
                }
            });
        }
    }

    angular.module('driver.state')
        .directive('zoomToBoundary', zoomToBoundary);

})();

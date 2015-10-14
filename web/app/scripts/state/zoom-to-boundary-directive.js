(function () {
    'use strict';

    /* ngInject */
    function zoomToBoundary(BoundaryState) {
        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            controller: '',
            require: 'leafletMap',
            link: link
        };
        return module;

        function link(scope, element, attrs, controller) {
            // Re-zoom the map when boundary is changed
            scope.$on('driver.state.boundarystate:selected', function() {
                controller.getMap().then(zoomToSelected);
            });
        }

        function zoomToSelected(map) {
            BoundaryState.getSelected().then(function(selected) {
                map.fitBounds(selected.bbox);
            });
        }
    }

    angular.module('driver.state')
        .directive('zoomToBoundary', zoomToBoundary);

})();

(function () {
    'use strict';

    /** Provides access to the leaflet map object instantiated by the directive */
    /* ngInject */
    function LeafletController($timeout, $q) {
        var ctl = this;
        var _map = null;
        initialize();

        function initialize() {
            _map = $q.defer();

            ctl.getMap = getMap;
            ctl.setMap = setMap;
        }

        /**
         * Get a promise reference to the map object created by the directive
         * @return {Promise} Resolves with an L.map object
         */
        function getMap() {
            return _map.promise;
        }

        /** Sets the map object for this controller. Call only once, on directive creation
         * @param {L.map} map The L.map object to use on this controller.
         */
        function setMap(map) {
            _map.resolve(map);

            // This helps in some situations where the map isn't initially rendered correctly due
            // to the container size being changed.
            $timeout(function() {
                map.invalidateSize();
            }, 0);
        }
    }

    /* ngInject */
    function LeafletMap(LeafletDefaults) {
        var module = {
            restrict: 'A',
            scope: {},
            controller: 'LeafletController',
            controllerAs: 'lf',
            bindToController: true,
            link: link
        };
        return module;

        function link(scope, element, attrs, controller) {
            var defaults = LeafletDefaults.get();
            var map = new L.map(element[0], defaults);

            // tell Leaflet where to find its images, or else it complains in production
            // see: https://github.com/Leaflet/Leaflet/issues/766
            if (!L.Icon.Default.imagePath) {
                L.Icon.Default.imagePath = 'styles/images';
            }

            controller.setMap(map);
        }
    }

    angular.module('Leaflet')
        .controller('LeafletController', LeafletController)
        .directive('leafletMap', LeafletMap);
})();

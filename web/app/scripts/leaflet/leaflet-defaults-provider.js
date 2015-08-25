(function() {
    'use strict';

    /**
     * Provides defaults for new maps created using the leafletMap directive.
     *
     * Defaults can be changed at config time via LeafletDefaults.setDefaults()
     *
    /* ngInject */
    function LeafletDefaultsProvider() {
        var svc = this;
        var defaults = {
            center: [0,0],
            zoom: 1,
            crs: L.CRS.EPSG3857
        };

        /**
         * Update defaults by merging user-set defaults into defaults object
         * @param {LeafletDefaults} newDefaults
         */
        svc.setDefaults = function (newDefaults) {
            angular.merge(defaults, newDefaults);
        };

        svc.$get = LeafletDefaults;

        /** Read-only wrapper around defaults */
        /* ngInject */
        function LeafletDefaults() {
            var module = {
                get: get
            };
            return module;

            /**
             * Return a copy of the current set of defaults
             * @return {LeafletDefaults}
             */
            function get() {
                return angular.extend({}, defaults);
            }
        }
    }

    angular.module('Leaflet')
        .provider('LeafletDefaults', LeafletDefaultsProvider);
})();

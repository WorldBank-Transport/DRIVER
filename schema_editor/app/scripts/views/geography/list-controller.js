(function () {
    'use strict';

    /* ngInject */
    function GeographyListController(Geography) {
        var ctl = this;
        initialize();

        /**
         * Custom filter to remove all boundaries which failed to parse
         */
        ctl.noFailures = function() {
            return function(putativeGeography) {
                if (putativeGeography.status === 'COMPLETE') {
                    return true;
                } else {
                    return false;
                }
            };
        };

        function initialize() {
          ctl.geographies = Geography.query();
        }
    }

    angular.module('ase.views.geography')
    .controller('GeoListController', GeographyListController);
})();

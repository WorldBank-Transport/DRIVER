(function () {
    'use strict';

    /* ngInject */
    function GeographyListController(Geography) {
        var ctl = this;
        initialize();

        /**
         * Predicate function used by template filter to remove boundaries which failed to parse
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

        /**
         * Function which attaches to the angular DOM and fires in case of deletion being called on geom
         */
        ctl.deleteGeo = function(uuid) {
            var deletionRequest = Geography.remove({uuid: uuid});
            deletionRequest.$promise.then(function() {
                ctl.geographies = _.filter(ctl.geographies, function(geo) {
                  return geo.uuid !== uuid;
                });
            });
        };

        function initialize() {
          ctl.geographies = Geography.query();
        }
    }

    angular.module('ase.views.geography')
    .controller('GeoListController', GeographyListController);
})();

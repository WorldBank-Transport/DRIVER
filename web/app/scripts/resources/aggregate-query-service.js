/**
 * This Service provides a centralized location to handle aggregate data - sums, percentages, etc.
 */
(function () {
    'use strict';

    /* ngInject */
    function RecordAggregates($q, RecordTypes, RecordState) {
        var svc = {
            recentCounts: recentCounts,
        };
        return svc;

        /**
         * Request the most recent 30, 90, 365 day counts for the currently selected record type
         */
        function recentCounts() {
            var deferred = $q.defer();
            // Record Type
            RecordState.getSelected().then(function(selected) {
                var uuid = selected.uuid;
                RecordTypes.recentCounts({id: uuid}).$promise.then(function(counts) {
                    deferred.resolve(counts);
                });
            });
            /* jshint camelcase: true */
            return deferred.promise;
        }
    }

    angular.module('driver.resources')
    .factory('RecordAggregates', RecordAggregates);

})();

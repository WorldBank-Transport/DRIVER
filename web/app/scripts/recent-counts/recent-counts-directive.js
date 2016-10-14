(function () {
    'use strict';

    /* ngInject */
    function RecentCounts() {
        var module = {
            restrict: 'EA',
            templateUrl: 'scripts/recent-counts/recent-counts.html',
            controller: 'RecentCountsController',
            controllerAs: 'recent'
        };
        return module;
    }

    angular.module('driver.recentCounts')
    .directive('driverRecentCounts', RecentCounts);

})();

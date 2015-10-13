(function () {
    'use strict';

    /* ngInject */
    function RecentProportions() {
        var module = {
            restrict: 'EA',
            templateUrl: 'scripts/recent-proportions/recent-proportions.html',
            controller: 'RecentProportionsController',
            controllerAs: 'recent',
            scope: {
                recordType: '='
            },
        };
        return module;
    }

    angular.module('driver.recentProportions')
    .directive('recentProportions', RecentProportions);

})();

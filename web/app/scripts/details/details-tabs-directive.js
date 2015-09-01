(function () {
    'use strict';

    /* ngInject */
    function DetailsTabs() {
        var module = {
            restrict: 'AE',
            scope: {
                recordSchema: '=',
                record: '='
            },
            templateUrl: 'scripts/details/details-tabs-partial.html',
            bindToController: true,
            controller: 'DetailsTabsController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsTabs', DetailsTabs);

})();

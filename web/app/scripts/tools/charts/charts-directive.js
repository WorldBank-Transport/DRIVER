(function () {
    'use strict';

    /* ngInject */
    function Charts() {
        var module = {
            restrict: 'AE',
            scope: {
                stepwise: '=',
                minDate: '=',
                maxDate: '=',
                toddow: '='
            },
            templateUrl: 'scripts/tools/charts/charts-partial.html',
            bindToController: true,
            controller: 'ChartsController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.tools.charts')
    .directive('driverCharts', Charts);

})();

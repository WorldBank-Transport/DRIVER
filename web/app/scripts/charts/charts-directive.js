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
            templateUrl: 'scripts/charts/charts-partial.html',
            bindToController: true,
            controller: 'ChartsController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.charts')
    .directive('driverCharts', Charts);

})();

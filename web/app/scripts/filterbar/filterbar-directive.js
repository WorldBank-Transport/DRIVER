(function () {
    'use strict';

    /* ngInject */
    function DriverFilterbar() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/filterbar/filterbar.html',
            controller: 'FilterbarController',
            controllerAs: 'filterbar'
        };
        return module;
    }

    angular.module('driver.filterbar')
    .directive('driverFilterbar', DriverFilterbar);

})();

(function () {
    'use strict';

    /* ngInject */
    function BlackSpots() {
        var module = {
            restrict: 'EA',
            templateUrl: 'scripts/black-spots/black-spots-partial.html',
            bindToController: true,
            replace: true,
            controller: 'BlackSpotsController',
            controllerAs: 'blackspots'
        };
        return module;
    }

    angular.module('driver.blackSpots')
    .directive('driverBlackSpots', BlackSpots);

})();

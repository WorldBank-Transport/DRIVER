(function () {
    'use strict';

    /* ngInject */
    function Map() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/map/map-partial.html',
            controller: 'MapController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.views.map')
    .directive('driverMap', Map);

})();

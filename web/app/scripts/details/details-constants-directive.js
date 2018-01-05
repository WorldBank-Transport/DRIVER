(function () {
    'use strict';

    /* ngInject */
    function DetailsConstants() {
        var module = {
            restrict: 'AE',
            scope: {
                record: '<'
            },
            templateUrl: 'scripts/details/details-constants-partial.html',
            bindToController: true,
            controller: 'DetailsConstantsController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsConstants', DetailsConstants);

})();

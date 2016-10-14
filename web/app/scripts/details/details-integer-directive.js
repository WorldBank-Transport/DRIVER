(function () {
    'use strict';

    /* ngInject */
    function DetailsInteger() {
        var module = {
            restrict: 'AE',
            scope: {
              property: '=',
              data: '=',
              compact: '='
            },
            templateUrl: 'scripts/details/details-integer-partial.html',
            bindToController: true,
            controller: 'DetailsIntegerController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsInteger', DetailsInteger);

})();

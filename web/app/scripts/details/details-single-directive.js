(function () {
    'use strict';

    /* ngInject */
    function DetailsSingle() {
        var module = {
            restrict: 'AE',
            scope: {
                data: '<',
                properties: '<',
                record: '<',
                recordSchema: '<',
                definition: '<',
                isSecondary: '<'
            },
            templateUrl: 'scripts/details/details-single-partial.html',
            bindToController: true,
            controller: 'DetailsSingleController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsSingle', DetailsSingle);

})();

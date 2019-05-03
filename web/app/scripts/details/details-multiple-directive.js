(function () {
    'use strict';

    /* ngInject */
    function DetailsMultiple() {
        var module = {
            restrict: 'AE',
            scope: {
                data: '=',
                properties: '=',
                record: '=',
                recordSchema: '=',
                definition: '=',
                isSecondary: '<'
            },
            templateUrl: 'scripts/details/details-multiple-partial.html',
            bindToController: true,
            controller: 'DetailsMultipleController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsMultiple', DetailsMultiple);

})();

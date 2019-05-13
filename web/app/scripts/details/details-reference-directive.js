(function () {
    'use strict';

    /* ngInject */
    function DetailsReference() {
        var module = {
            restrict: 'AE',
            scope: {
                data: '=',
                property: '=',
                record: '=',
                recordSchema: '=',
                compact: '='
            },
            templateUrl: 'scripts/details/details-reference-partial.html',
            bindToController: true,
            controller: 'DetailsReferenceController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsReference', DetailsReference);

})();

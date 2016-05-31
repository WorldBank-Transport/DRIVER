(function () {
    'use strict';

    /* ngInject */
    function DetailsSelectlist() {
        var module = {
            restrict: 'AE',
            scope: {
                property: '=',
                data: '=',
                compact: '='
            },
            templateUrl: 'scripts/details/details-selectlist-partial.html',
            bindToController: true,
            controller: 'DetailsSelectlistController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsSelectlist', DetailsSelectlist);

})();

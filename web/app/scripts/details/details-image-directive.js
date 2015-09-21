(function () {
    'use strict';

    /* ngInject */
    function DetailsImage() {
        var module = {
            restrict: 'AE',
            scope: {
                property: '=',
                data: '=',
                compact: '='
            },
            templateUrl: 'scripts/details/details-image-partial.html',
            bindToController: true,
            controller: 'DetailsImageController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsImage', DetailsImage);

})();

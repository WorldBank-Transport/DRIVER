(function () {
    'use strict';

    /* ngInject */
    function DetailsField() {
        var module = {
            restrict: 'AE',
            scope: {
              compact: '=',
              data: '=',
              property: '=',
              record: '=',
              isSecondary: '<'
            },
            templateUrl: 'scripts/details/details-field-partial.html',
            bindToController: true,
            controller: 'DetailsFieldController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.details')
    .directive('driverDetailsField', DetailsField);

})();

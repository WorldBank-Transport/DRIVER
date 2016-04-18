(function () {
    'use strict';

    /* ngInject */
    function Interventions() {
        var module = {
            restrict: 'AE',
            templateUrl: 'scripts/tools/interventions/interventions-partial.html',
            controller: 'InterventionsController',
            controllerAs: 'ctl',
            bindToController: true,
            scope: {
                recordQueryParams: '=params'
            }
        };
        return module;

    }

    angular.module('driver.tools.interventions')
    .directive('driverInterventions', Interventions);

})();

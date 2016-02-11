(function () {
    'use strict';

    /* ngInject */
    function Interventions() {
        var module = {
            restrict: 'AE',
            scope: {
            },
            templateUrl: 'scripts/interventions/interventions-partial.html',
            bindToController: true,
            controller: 'InterventionsController',
            controllerAs: 'interventions'
        };
        return module;
    }

    angular.module('driver.interventions')
    .directive('driverInterventions', Interventions);

})();

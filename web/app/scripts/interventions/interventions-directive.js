(function () {
    'use strict';

    /* ngInject */
    function Interventions() {
        var module = {
            restrict: 'AE',
            scope: {
                minDate: '=',
                maxDate: '='
            },
            templateUrl: 'scripts/interventions/interventions-partial.html',
            bindToController: true,
            controller: 'InterventionsController',
            controllerAs: 'ctl'
        };
        return module;
    }

    angular.module('driver.interventions')
    .directive('driverInterventions', Interventions);

})();

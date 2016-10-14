(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('assignments', {
            url: '/assignments/?' + ['num_personnel', 'shift_start', 'shift_end',
                                     'polygon_id', 'polygon', 'record_type'].join('&'),
            templateUrl: 'scripts/enforcers/enforcer-assignments-partial.html',
            label: 'NAV.ENFORCER_ASSIGNMENTS',
            controller: 'EnforcerAssignmentsController',
            controllerAs: 'ctl',
            showInNavbar: false
        });
    }

    angular.module('driver.enforcers', [
        'ui.router',
        'ase.auth',
        'driver.config',
        'driver.resources',
        'driver.state',
        'driver.localization',
        'ui.bootstrap',
        'datetimepicker',
        'Leaflet'
    ]).config(StateConfig);

})();

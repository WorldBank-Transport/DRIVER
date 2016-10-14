(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('report', {
            url: '/report/?' + ['row_period_type', 'row_boundary_id', 'row_choices_path',
                                'col_period_type', 'col_boundary_id', 'col_choices_path',
                                'aggregation_boundary', 'occurred_max', 'occurred_min',
                                'jsonb', 'record_type', 'polygon_id', 'calendar'].join('&'),
            templateUrl: 'scripts/custom-reports/custom-report-partial.html',
            label: 'NAV.CUSTOM_REPORT',
            controller: 'CustomReportController',
            controllerAs: 'ctl',
            showInNavbar: false
        });
    }

    angular.module('driver.customReports', [
        'ui.router',
        'ase.auth',
        'driver.config',
        'driver.resources',
        'driver.state',
        'driver.localization',
        'ui.bootstrap',
    ]).config(StateConfig);

})();

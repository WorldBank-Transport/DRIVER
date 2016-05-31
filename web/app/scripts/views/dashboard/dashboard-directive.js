(function () {
    'use strict';

    /* ngInject */
    function Dashboard() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/dashboard/dashboard-partial.html',
            controller: 'DashboardController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.views.dashboard')
    .directive('driverDashboard', Dashboard);

})();

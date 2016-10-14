(function () {
    'use strict';

    /* ngInject */
    function ChartsController($rootScope, $scope) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.isOpen = false;
            ctl.toggle = toggle;
        }

        function toggle() {
            ctl.isOpen = !ctl.isOpen;
            if (ctl.isOpen) {
                $rootScope.$broadcast('driver.tools.charts.open');
            }
        }

        $scope.$on('driver.tools.export.open', function () { ctl.isOpen = false; });
        $scope.$on('driver.tools.interventions.open', function () { ctl.isOpen = false; });
        $scope.$on('driver.tools.costs.open', function () { ctl.isOpen = false; });
    }

    angular.module('driver.tools.charts')
    .controller('ChartsController', ChartsController);

})();

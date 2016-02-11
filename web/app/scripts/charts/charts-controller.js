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
                $rootScope.$broadcast('driver.charts.open');
            }
        }

        $scope.$on('driver.export.open', function () { ctl.isOpen = false; });
    }

    angular.module('driver.charts')
    .controller('ChartsController', ChartsController);

})();

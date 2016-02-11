(function () {
    'use strict';

    /* ngInject */
    function Export() {
        var module = {
            restrict: 'AE',
            templateUrl: 'scripts/export/export-partial.html',
            controller: 'ExportController',
            controllerAs: 'ctl',
            bindToController: true,
            scope: {
                recordQueryParams: '=params'
            },
        };
        return module;

    }

    angular.module('driver.export')
    .directive('driverExport', Export);

})();

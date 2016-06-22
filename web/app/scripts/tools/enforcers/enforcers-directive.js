(function () {
    'use strict';

    /* ngInject */
    function EnforcersTool() {
        var module = {
            restrict: 'AE',
            templateUrl: 'scripts/tools/enforcers/enforcers-tool-partial.html',
            controller: 'EnforcersToolController',
            controllerAs: 'ctl',
            bindToController: true,
            scope: {
                recordQueryParams: '=params'
            }
        };
        return module;

    }

    angular.module('driver.tools.enforcers')
    .directive('enforcersTool', EnforcersTool);

})();

(function () {
    'use strict';

    /* ngInject */
    function ElementStats($window) {
        var module = {
            restrict: 'A',
            controller: 'elementStatsController',
            controllerAs: 'elemStat',
            link: function(scope, elems, attrs, ctl) {
                var elem = $(elems[0]);
                ctl.height = elem.height();
                ctl.width = elem.width();
                angular.element($window).bind('resize', _.throttle(function() {
                    scope.$apply(function() {
                        ctl.height = elem.height();
                        ctl.width = elem.width();
                    });
                }, 1000));
            }

        };
        return module;
    }

    angular.module('driver.elemstat')
    .directive('elementStats', ElementStats);

})();

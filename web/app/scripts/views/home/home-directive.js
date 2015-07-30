(function () {
    'use strict';

    /* ngInject */
    function Home() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/home/home-partial.html',
            controller: 'HomeController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.views.home')
    .directive('driverHome', Home);

})();

(function () {
    'use strict';

    /* ngInject */
    function DuplicatesList() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/duplicates/duplicates-list-partial.html',
            controller: 'DuplicatesListController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.views.duplicates')
    .directive('driverDuplicatesList', DuplicatesList);

})();

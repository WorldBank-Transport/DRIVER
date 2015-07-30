(function () {
    'use strict';

    /* ngInject */
    function RecordAdd() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/record/add-edit-partial.html',
            controller: 'RecordAddController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.views.record')
    .directive('driverRecordAdd', RecordAdd);

})();

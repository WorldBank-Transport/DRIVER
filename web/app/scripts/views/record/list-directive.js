(function () {
    'use strict';

    /* ngInject */
    function RecordList() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/record/list-partial.html',
            controller: 'RecordListController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('driver.views.record')
    .directive('driverRecordList', RecordList);

})();

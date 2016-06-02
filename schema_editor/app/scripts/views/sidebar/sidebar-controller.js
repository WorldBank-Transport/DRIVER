(function () {
    'use strict';

    /* ngInject */
    function SidebarController($scope, RecordTypes) {
        var ctl = this;
        initialize();

        function initialize() {
            refreshRecordTypes();
            $scope.$on('ase.recordtypes.changed', refreshRecordTypes);
        }

        /*
         * Queries for an updated set of active record types
         */
        function refreshRecordTypes() {
            ctl.recordTypes = RecordTypes.query({ active: 'True' });
        }
    }

    angular.module('ase.views.sidebar')
    .controller('SidebarController', SidebarController);
})();

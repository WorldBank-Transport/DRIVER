(function () {
    'use strict';

    /* ngInject */
    function RTEditController($log, $scope, $state, $stateParams, RecordTypes) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.recordType = RecordTypes.get({ id: $stateParams.uuid });
            ctl.submitForm = submitForm;
        }

        /*
         * Updates the record type and switches to the list view on success
         */
        function submitForm() {
            RecordTypes.update(ctl.recordType, function() {
                $scope.$emit('ase.recordtypes.changed');
                $state.go('rt.list');
            }, function(error) {
                $log.debug('Error while editing recordType: ', error);
            });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTEditController', RTEditController);
})();

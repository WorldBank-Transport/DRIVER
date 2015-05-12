(function () {
    'use strict';

    /* ngInject */
    function RTAddController($log, $state, RecordTypes) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.recordType = {};
            ctl.submitForm = submitForm;
        }

        /*
         * Creates the record type and switches to the list view on success
         */
        function submitForm() {
            RecordTypes.create(ctl.recordType, function() {
                $state.go('rt.list');
            }, function(error) {
                $log.debug('Error while adding recordType: ', error);
            });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTAddController', RTAddController);
})();

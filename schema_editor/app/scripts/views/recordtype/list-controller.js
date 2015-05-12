(function () {
    'use strict';

    /* ngInject */
    function RTListController(RecordTypes) {
        var ctl = this;
        initialize();

        function initialize() {
            ctl.deactivateRecordType = deactivateRecordType;
            refreshRecordTypes();
        }

        /*
         * Queries for an updated set of active record types
         */
        function refreshRecordTypes() {
            ctl.recordTypes = RecordTypes.query({ active: 'True' });
        }

        /*
         * Updates a record type with a deactivated state
         * @param {object} recordType Record type to deactivate
         */
        function deactivateRecordType(recordType) {
            // TODO: need confirmation dialog/spinner/error handling/etc.
            //   This applies to all queries and should be dealt with in a new task.
            RecordTypes.update({
                uuid: recordType.uuid,
                active: false
            }, function() {
                refreshRecordTypes();
            }, function(error) {
                console.error('Error while deleting recordType: ', error);
            });
        }
    }

    angular.module('ase.views.recordtype')
    .controller('RTListController', RTListController);

})();

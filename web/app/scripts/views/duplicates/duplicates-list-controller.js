(function () {
    'use strict';

    /* ngInject */
    function DuplicatesListController($scope, $rootScope, $log, $modal, $state, AuthService,
                                      InitialState, WebConfig, Duplicates, RecordState,
                                      RecordSchemaState ) {
        var ctl = this;
        ctl.currentOffset = 0;
        ctl.numDuplicatesPerPage = WebConfig.record.limit; //Just use the records limit
        ctl.getPreviousDuplicates = getPreviousDuplicates;
        ctl.getNextDuplicates = getNextDuplicates;
        ctl.showResolveModal = showResolveModal;
        ctl.userCanWrite = false;

        InitialState.ready().then(init);

        function init() {
            ctl.isInitialized = false;
            ctl.userCanWrite = AuthService.hasWriteAccess();

            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(loadRecordSchema)
                .then(loadDuplicates);
        }

        function loadRecordSchema() {
            /* jshint camelcase: false */
            var currentSchemaId = ctl.recordType.current_schema;
            /* jshint camelcase: true */

            return RecordSchemaState.get(currentSchemaId)
                .then(function(recordSchema) {
                    ctl.recordSchema = recordSchema;
                });
        }

        /*
         * Loads a page of duplicates from the API
         * @param {int} offset Optional offset value, relative to current offset, used
         *                     for pulling paginated results. May be positive or negative.
         * @return {promise} Promise to load duplicates
         */
        function loadDuplicates(offset) {
            var paramsOffset;
            if (offset) {
                ctl.currentOffset += offset;
                if (ctl.currentOffset) {
                    paramsOffset = ctl.currentOffset;
                }
            } else {
                ctl.currentOffset = 0;
                paramsOffset = 0;
            }

            /* jshint camelcase: false */
            return Duplicates.query({record_type: ctl.recordType.uuid,
                                     limit: ctl.numDuplicatesPerPage,
                                     offset: paramsOffset}).$promise
            /* jshint camelcase: true */
                .then(function(duplicates) {
                    ctl.duplicates = duplicates;
                }
            );
        }

        // Loads the previous page of paginated duplicates results
        function getPreviousDuplicates() {
            loadDuplicates(-ctl.numDuplicatesPerPage);
        }

        // Loads the next page of paginated duplicates results
        function getNextDuplicates() {
            loadDuplicates(ctl.numDuplicatesPerPage);
        }

        // Show a modal for resolving the given duplicate
        function showResolveModal(duplicate) {
            $modal.open({
                templateUrl: 'scripts/views/duplicates/duplicate-modal-partial.html',
                controller: 'ResolveDuplicateModalController as modal',
                size: 'lg',
                resolve: {
                    duplicate: function() {
                        return duplicate;
                    },
                    recordType: function() {
                        return ctl.recordType;
                    },
                    recordSchema: function() {
                        return ctl.recordSchema;
                    },
                }
            });
        }
    }

    angular.module('driver.views.duplicates')
    .controller('DuplicatesListController', DuplicatesListController);

})();

(function () {
    'use strict';

    /* ngInject */
    function DuplicatesListController($scope, $log, $modal, $state, AuthService,
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
            var newOffset;
            if (offset) {
                newOffset = ctl.currentOffset + offset;
            } else if (offset === 0) {
                newOffset = 0;
            } else {
                newOffset = ctl.currentOffset;
            }

            /* jshint camelcase: false */
            return Duplicates.query({record_type: ctl.recordType.uuid,
                                     limit: ctl.numDuplicatesPerPage,
                                     offset: newOffset}).$promise
            /* jshint camelcase: true */
                .then(function(duplicates) {
                    ctl.duplicates = duplicates;
                    ctl.currentOffset = newOffset;
                    onDuplicatesLoaded();
                }
            );
        }

        function onDuplicatesLoaded() {
            var detailsDefinitions = _.filter(ctl.recordSchema.schema.definitions,
                function(val, key) {
                    if (key.indexOf('Details') > -1) {
                        ctl.detailsPropertyKey = key;
                        return val;
                    }
                });
            if (detailsDefinitions.length !== 1) {
                $log.error('Expected one details definition, found ' + detailsDefinitions.length);
                return;
            }

            // Get the property names -- sorted by propertyOrder
            ctl.headerKeys = _(detailsDefinitions[0].properties)
                .omit('_localId')
                .map(function(obj, propertyName) {
                    obj.propertyName = propertyName;
                    return obj;
                })
                .sortBy('propertyOrder')
                .value();
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
                templateUrl: 'scripts/views/duplicates/resolve-duplicate-modal-partial.html',
                controller: 'ResolveDuplicateModalController as modal',
                size: 'lg',
                resolve: {
                    params: function() {
                        return {
                            duplicate: duplicate,
                            recordType: ctl.recordType,
                            recordSchema: ctl.recordSchema,
                            properties: ctl.headerKeys,
                            propertyKey: ctl.detailsPropertyKey
                        };
                    }
                }
            }).result.then(function () {
                loadDuplicates();
            });
        }
    }

    angular.module('driver.views.duplicates')
    .controller('DuplicatesListController', DuplicatesListController);

})();

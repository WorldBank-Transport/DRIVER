(function () {
    'use strict';

    /* ngInject */
    function RecordListController($scope, $rootScope, $log, $modal, $state, uuid4, AuthService,
                                  FilterState, InitialState, Notifications, RecordSchemaState,
                                  RecordState, QueryBuilder, WebConfig) {
        var ctl = this;
        ctl.currentOffset = 0;
        ctl.numRecordsPerPage = WebConfig.record.limit;
        ctl.maxDataColumns = 4; // Max number of dynamic data columns to show
        ctl.getPreviousRecords = getPreviousRecords;
        ctl.getNextRecords = getNextRecords;
        ctl.showDetailsModal = showDetailsModal;
        ctl.restoreFilters = restoreFilters;
        ctl.isInitialized = false;
        ctl.userCanWrite = false;

        InitialState.ready().then(init);

        function init() {
            ctl.isInitialized = false;
            ctl.userCanWrite = AuthService.hasWriteAccess();
            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(loadRecordSchema)
                .then(restoreFilters);
        }

        function loadRecordSchema() {
            /* jshint camelcase: false */
            var currentSchemaId = ctl.recordType.current_schema;
            /* jshint camelcase: true */

            return RecordSchemaState.get(currentSchemaId)
                .then(function(recordSchema) {
                    ctl.recordSchema = recordSchema;
                    return;
                }).then(onSchemaLoaded);
        }

        /*
         * Get previously saved filters and set back the filter bar,
         * then load records once the filters are set.
         */
        function restoreFilters() {
            // this will trigger `driver.filterbar:changed` when complete
            FilterState.restoreFilters();
        }

        /*
         * Loads a page of records from the API
         * @param {int} offset Optional offset value, relative to current offset, used
         *                     for pulling paginated results. May be positive or negative.
         * @return {promise} Promise to load records
         */
        function loadRecords(offset) {
            ctl.loadingRecords = true;
            var newOffset;
            if (offset) {
                newOffset = ctl.currentOffset + offset;
            } else {
                newOffset = 0;
            }

            return QueryBuilder.djangoQuery(newOffset)
            .then(function(records) {
                ctl.records = records;
                ctl.currentOffset = newOffset;
            }).finally(function() {
                ctl.loadingRecords = false;
            });
        }

        function onSchemaLoaded() {
            var detailsDefinitions = _.filter(ctl.recordSchema.schema.definitions,
                function(val, key) {
                    if (key.indexOf('Details') > -1) {
                        // keep the actual field name
                        // for lookup on ctl.recordSchema.schema.definitions
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
                .map('propertyName')
                .value();
        }

        // Loads the previous page of paginated record results
        function getPreviousRecords() {
            loadRecords(-ctl.numRecordsPerPage);
        }

        // Loads the next page of paginated record results
        function getNextRecords() {
            loadRecords(ctl.numRecordsPerPage);
        }

        // Show a details modal for the given record
        function showDetailsModal(record) {
            $modal.open({
                templateUrl: 'scripts/views/record/details-modal-partial.html',
                controller: 'RecordDetailsModalController as modal',
                size: 'lg',
                resolve: {
                    record: function() {
                         return record;
                    },
                    recordType: function() {
                        return ctl.recordType;
                    },
                    recordSchema: function() {
                        return ctl.recordSchema;
                    },
                    userCanWrite: function() {
                        return ctl.userCanWrite;
                    }
                }
            });
        }

        // listen for event when filterbar is set
        var filterbarHandler = $rootScope.$on('driver.filterbar:changed', function() {
            if (ctl.isInitialized) {
                ctl.currentOffset = 0;
            }

            loadRecords()
              .then(function() {
                  ctl.isInitialized = true;
              });
        });

        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            // Only reload records in this handler after initialization is done.
            // This handler is for when the user changes the record type selection.
            if (!ctl.isInitialized) {
                return;
            }

            if (ctl.recordType !== selected) {
                ctl.recordType = selected;
                loadRecordSchema()
                    .then(loadRecords);
            }
        });

        $scope.$on('driver.state.boundarystate:selected', function() {
            if (!ctl.isInitialized) {
                return;
            }

            loadRecords();
        });

        // $rootScope listeners must be manually unbound when the $scope is destroyed
        $scope.$on('$destroy', filterbarHandler);
    }

    angular.module('driver.views.record')
    .controller('RecordListController', RecordListController);

})();

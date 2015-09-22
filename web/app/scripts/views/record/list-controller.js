(function () {
    'use strict';

    /* ngInject */
    function RecordListController($scope, $rootScope, $log, $state, uuid4, FilterState,
                                  Notifications, Records, RecordSchemas, RecordState) {
        var ctl = this;
        ctl.currentOffset = 0;
        ctl.numRecordsPerPage = 10;
        ctl.maxDataColumns = 4; // Max number of dynamic data columns to show
        ctl.filterParams = {};
        ctl.getPreviousRecords = getPreviousRecords;
        ctl.getNextRecords = getNextRecords;
        ctl.restoreFilters = restoreFilters;
        ctl.isInitialized = false;

        initialize();


        function initialize() {
            ctl.isInitialized = false;
            RecordState.getSelected().then(function(selected) { ctl.recordType = selected; })
                .then(loadRecordSchema)
                .then(restoreFilters);
        }

        function loadRecordSchema() {
            /* jshint camelcase: false */
            var currentSchemaId = ctl.recordType.current_schema;
            /* jshint camelcase: true */

            return RecordSchemas.get({ id: currentSchemaId })
                .$promise.then(function(recordSchema) {
                    ctl.recordSchema = recordSchema;
                });
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
            /* jshint camelcase: false */
            var params = { record_type: ctl.recordType.uuid };
            /* jshint camelcase: true */

            if (offset) {
                ctl.currentOffset += offset;
                if (ctl.currentOffset) {
                    params.offset = ctl.currentOffset;
                }
            }

            _.extend(params, ctl.filterParams);

            return Records.get(params)
                .$promise.then(function(records) {
                    ctl.records = records;
                });
        }

        function onRecordsLoaded() {
            var detailsDefinitions = _.filter(ctl.recordSchema.schema.definitions, 'details');
            if (detailsDefinitions.length !== 1) {
                $log.error('Expected one details definition, found ' + detailsDefinitions.length);
                return;
            }

            ctl.propertiesKey = detailsDefinitions[0].properties;
            ctl.headerKeys = _.without(_.keys(ctl.propertiesKey), '_localId');
            ctl.detailsProperty = detailsDefinitions[0].title;
        }

        // Loads the previous page of paginated record results
        function getPreviousRecords() {
            loadRecords(-ctl.numRecordsPerPage);
        }

        // Loads the next page of paginated record results
        function getNextRecords() {
            loadRecords(ctl.numRecordsPerPage);
        }

        // listen for event when filterbar is set
        var filterbarHandler = $rootScope.$on('driver.filterbar:changed', function(event, data) {
            // initialize filters before loading records
            ctl.filterParams = data;

            if (ctl.isInitialized) {
                ctl.currentOffset = 0;
            }

            loadRecords()
            .then(onRecordsLoaded)
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
                    .then(loadRecords)
                    .then(onRecordsLoaded);
            }
        });

        // $rootScope listeners must be manually unbound when the $scope is destroyed
        $scope.$on('$destroy', filterbarHandler);
    }

    angular.module('driver.views.record')
    .controller('RecordListController', RecordListController);

})();

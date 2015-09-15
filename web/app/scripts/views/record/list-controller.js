(function () {
    'use strict';

    /* ngInject */
    function RecordListController($scope, $rootScope, $log, $state, uuid4, Notifications,
                                 Records, RecordSchemas, RecordState, FilterState) {
        var ctl = this;
        ctl.currentOffset = 0;
        ctl.numRecordsPerPage = 10;
        ctl.maxDataColumns = 4; // Max number of dynamic data columns to show
        ctl.filterParams = {};
        ctl.getPreviousRecords = getPreviousRecords;
        ctl.getNextRecords = getNextRecords;
        ctl.restoreFilters = restoreFilters;

        initialize();


        function initialize() {
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
            // listen for event when filterbar is set
            $rootScope.$on('driver.filterbar:changed', function(event, data) {
                // initialize filters before loading records
                ctl.filterParams = data;
                loadRecords()
                .then(onRecordsLoaded)
                .then(function() {
                    $scope.$on('driver.state.recordstate:selected', function(event, selected) {
                        if (ctl.recordType !== selected) {
                            ctl.recordType = selected;
                            loadRecordSchema()
                                .then(loadRecords)
                                .then(onRecordsLoaded);
                        }
                    });

                    // now set event listener to reset list when filters change
                    $rootScope.$on('driver.filterbar:changed', function(event, data) {
                        ctl.currentOffset = 0;
                        ctl.filterParams = data;
                        loadRecords().then(onRecordsLoaded);
                    });
                });
            });

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
    }

    angular.module('driver.views.record')
    .controller('RecordListController', RecordListController);

})();

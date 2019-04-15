(function () {
    'use strict';

    /* ngInject */
    function FilterbarController($modal, $scope, $timeout, debounce, RecordSchemaState,
                                 AuthService, FilterState, RecordState, WebConfig) {
        var ctl = this;
        ctl.filters = {};
        ctl.filterPolygon = null;
        ctl.recordLabel = '';
        ctl.reset = reset;
        ctl.showSavedFiltersModal = showSavedFiltersModal;
        ctl.userCanAdd = false;
        ctl.hasWriteAccess = AuthService.hasWriteAccess();
        ctl.showWeatherFilter = WebConfig.filters.weather.visible;
        ctl.showCreatedByFilter = WebConfig.filters.createdBy.visible;
        ctl.showCreatedDateFilter = ctl.hasWriteAccess && WebConfig.filters.createdDate.visible;
        init();

        function init() {
            ctl.userCanAdd = AuthService.hasWriteAccess();
            RecordState.getSelected().then(function(selected) {
                onRecordTypeSelected(selected);
            });
        }

        /**
         * A simple function to add/update a filter
         *
         * @param filterLabel {string} label of which field to filter
         * @param filterObj {object} filter data
         */
        ctl.updateFilter = function(filterLabel, filterObj) {
            if (filterObj || filterObj === 0) {
                ctl.filters[filterLabel] = angular.copy(filterObj);
            } else {
                //unset
                delete ctl.filters[filterLabel];
            }
            FilterState.saveFilters(ctl.filters);
            ctl.sendFilter();
        };

        /**
         * Set the bounding polygon for the filtering region.
         *
         * @param {Object} polygon GeoJSON polygon to filter by.
         */
         ctl.setFilterPolygon = function(polygon) {
             ctl.filterPolygon = !!polygon ? polygon : null;
             FilterState.saveFilters(ctl.filters, ctl.filterPolygon);
             ctl.sendFilter();
         };

        /**
         * Emit event with the built query parameters.
         * This function is debounced in order to prevent many requests for records
         * as filters are being rapidly changed (e.g. as multiple items are being checked).
         */
        ctl.sendFilter = debounce(function() {
            $scope.$emit('driver.filterbar:changed');
        }, 500);

        /**
         * Emit the currently set filters when asked (loading a view; no filter change.)
         */
        $scope.$on('driver.filterbar:send', function() {
            ctl.sendFilter();
        });

        /**
         * When the record type changes, request the new schema
         */
        $scope.$on('driver.state.recordstate:selected',
                   function(event, selected) { onRecordTypeSelected(selected); });

        function onRecordTypeSelected(selected) {
            if (selected) {
                // get label for add record button
                ctl.recordLabel = selected.label;

                /* jshint ignore:start */
                RecordSchemaState.getFilterables(selected.current_schema)
                  .then(function(filterables) {
                      ctl.filterables = filterables;
                      $timeout(function() { FilterState.restoreFilters(); });
                  });
                /* jshint ignore:end */
            }
        }

        /**
         * Reset filter state and all filter widgets
         */
        function reset() {
            FilterState.reset();
            $scope.$broadcast('driver.filterbar:reset');
            $timeout(ctl.sendFilter);
        }

        // Shows the saved filters modal
        function showSavedFiltersModal() {
            $modal.open({
                templateUrl: 'scripts/saved-filters/saved-filters-modal-partial.html',
                controller: 'SavedFiltersModalController as modal',
                size: 'lg'
            });
        }

        $scope.$on('driver.filterbar:restore', function(event, filters) {
            var filterOn = _.keys(ctl.filterables);
            // Keep the old date range so that loading a filter doesn't revert to defaults
            var dateRange = ctl.filters.__dateRange;
            var value;
            ctl.filters = filters[0];
            ctl.filterPolygon = filters[1];
            if (!ctl.filters.__dateRange && dateRange) {
                ctl.filters.__dateRange = dateRange;
            }
            _.each(FilterState.getNonJsonFilterNames(), function(filterName) {
                if (ctl.filters[filterName]) {
                    filterOn.push(filterName);
                }
            });

            _.each(filterOn, function(label) {
                if (ctl.filters[label]) {
                    value = ctl.filters[label];
                } else {
                    value = { contains: [] };
                }
                // listen for this in filter widget controllers to set value if label matches
                $scope.$broadcast('driver.filterbar:restored', {label: label, value: value});
            });

            ////////////////////////////////////////////////////////////////////////
            // TODO: Listen to this on map and draw back polygon somehow?
            // Also, listen to this in filter bar and draw some sort of indicator with clear button
            // to show there is a geo filter in place?
            $scope.$broadcast('driver.filterbar:polygonrestored', ctl.filterPolygon);
            ctl.sendFilter();
        });

        $scope.$on('driver.views.map:filterdrawn', function(event, polygon) {
            ctl.setFilterPolygon(polygon);
        });

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('FilterbarController', FilterbarController);

})();

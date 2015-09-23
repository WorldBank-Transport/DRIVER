(function () {
    'use strict';

    /* ngInject */
    function FilterbarController($log, $scope, FilterState, RecordSchemas) {
        var ctl = this;
        ctl.filters = {};
        ctl.filterPolygon = null;

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
         * Transform filter label-value pairs into parameters to send to API.
         *
         * @returns {Object} Filter query params object ready to send off to API endpoint
         */
        ctl.buildFilter = function() {
            var params = {};
            angular.forEach(_.omit(ctl.filters, '__dateRange'), function(value, key) {
                // extract the object hierarchy from the label
                var parents = key.split('#').reverse();
                var immediateParent = parents.shift();

                // Build out query object for this filter, which has nested structure like:
                // {outerParent: {innerParent: value}}
                var filterParam = {};
                filterParam[immediateParent] = value;
                _.each(parents, function(parent) {
                    var obj = {};
                    obj[parent] = filterParam;
                    filterParam = obj;
                });

                _.merge(params, filterParam);
            });

            params = {jcontains: params};

            // GEOSGeometry only wants the `geometry` part of the GeoJSON object
            if (ctl.filterPolygon && ctl.filterPolygon.features &&
                ctl.filterPolygon.features.length) {

                var geom = ctl.filterPolygon.features[0].geometry;
                params.polygon = geom;
            } else {
                ctl.filterPolygon = null;
            }

            return params;
        };

        /**
         * Emit event with the built query parameters.
         */
        ctl.sendFilter = function() {
            $scope.$emit('driver.filterbar:changed', ctl.buildFilter());
        };

        /**
         * Emit the currently set filters when asked (loading a view; no filter change.)
         */
        $scope.$on('driver.filterbar:send', function() {
            ctl.sendFilter();
        });

        /**
         * When the record type changes, request the new schema
         */
        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            if (selected) {
                RecordSchemas.get({
                  /* jshint ignore:start */
                  id: selected.current_schema
                  /* jshint ignore:end */
                }).$promise.then(function(data) {
                    var definitions = data.schema.definitions;

                    var namespaced = {};
                    _.forEach(definitions, function(schema, i) {
                        _.forEach(schema.properties, function(property, j) {
                            namespaced[i + '#' + j] = property;
                        });
                    });

                    var conditions = function(val) { return val.isSearchable; };
                    ctl.filterables = {};
                    _.forEach(namespaced, function(d, i) {
                        if (conditions(d)) {
                            ctl.filterables[i] = d;
                        }
                    });
                });
            }
        });

        $scope.$on('driver.filterbar:restore', function(event, filters) {

            ctl.filters = filters[0];
            ctl.filterPolygon = filters[1];

            _.each(ctl.filters, function(value, label) {
                $log.debug('restored filter ' + label + ' has val ' + value);
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

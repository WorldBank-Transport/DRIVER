(function () {
    'use strict';

    /* ngInject */
    function FilterbarController($scope, RecordSchemas) {
        var ctl = this;
        ctl.filters = {};

        /**
         * A simple function to add/update a filter
         *
         * @param filterLabel {string} label of which field to filter
         * @param filterObj {object} filter data
         */
        ctl.updateFilter = function(filterLabel, filterObj) {
            ctl.filters[filterLabel] = angular.copy(filterObj);
        };

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

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('filterbarController', FilterbarController);

})();

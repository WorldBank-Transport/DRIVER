(function () {
    'use strict';

    /* ngInject */
    function FilterbarController($log, $window, $rootScope, $scope, RecordSchemas) {
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
                /* jshint ignore:start */
                RecordSchemas.get({ id: selected.current_schema }).$promise.then(function(data) {
                /* jshint ignore:end */
                    var definitions = data.schema.definitions;
                    $scope.filterables = _(definitions)
                      .map(function(d) { return d.properties; })
                      .filter(function(d) { return !d.isSearchable || d.format === 'number'; })
                      .value();

                    var namespaced = {};
                    _.forEach(definitions, function(schema, i) {
                        _.forEach(schema.properties, function(property, j) {
                            namespaced[i + '#' + j] = property;
                        });
                    });

                    var conditions = function(val) { return val.format === 'number'; };
                    var filterable = {};
                    _.forEach(namespaced, function(d, i) {
                        if (conditions(d)) {
                            filterable[i] = d;
                        }
                    });
                    ctl.filterables = {'Accident Details#Number with minor injuries': filterable['Accident Details#Number with minor injuries']};

                });
            }
        });

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('filterbarController', FilterbarController);

})();

(function () {
    'use strict';

    /* ngInject */
    function FilterbarController($log, $window, $rootScope, $scope, RecordSchemas) {
        var ctl = this;
        ctl.filters = {};

        ctl.updateFilter = function(filterLabel, filterObj) {
            ctl.filters[filterLabel] = angular.copy(filterObj);
            console.log(ctl.filters);
        };

        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            if (selected) {
                RecordSchemas.get({ id: selected.current_schema }).$promise.then(function(data) {
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

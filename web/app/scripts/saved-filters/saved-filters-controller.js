(function () {
    'use strict';

    /* ngInject */
    function SavedFiltersController($scope, InitialState, SavedFilters) {
        var ctl = this;
        var limit = 50;  // max number of filters to query for
        ctl.savedFilters = null;
        ctl.deleteFilter = deleteFilter;
        ctl.viewFilter = viewFilter;
        $scope.$on('driver.state.savedfilter:refresh', refreshFilters);
        InitialState.ready().then(refreshFilters);
        return ctl;

        // Retrieves a list of saved filters and sets them on the controller
        function refreshFilters() {
            SavedFilters.query({ limit: limit }).$promise.then(function(filters) {
                ctl.savedFilters = filters;
            });
        }

        // Deletes a saved filter
        function deleteFilter(savedFilter) {
            SavedFilters.delete({ id: savedFilter.uuid }).$promise.then(function() {
                refreshFilters();
            });
        }

        // Activates the selected filter
        function viewFilter(savedFilter) {
            /* jshint camelcase: false */
            $scope.$emit('driver.savedFilters:filterSelected', savedFilter.filter_json);
            /* jshint camelcase: true */
        }
    }

    angular.module('driver.savedFilters')
    .controller('SavedFiltersController', SavedFiltersController);

})();

(function () {
    'use strict';

    /* ngInject */
    function RecentCountsController($scope, BoundaryState, InitialState,
                                    RecordAggregates, RecordState) {
        var ctl = this;
        InitialState.ready().then(init);
        return ctl;

        function init() {
            RecordState.getSelected()
                .then(BoundaryState.getSelected().then(function(selected) {
                    ctl.boundaryId = selected.uuid;
                }))
                .then(function(recordType) {
                    /* jshint camelcase: false */
                    ctl.recordTypePlural = recordType.plural_label;
                    /* jshint camelcase: true */
                    loadRecords();
                });

            $scope.$on('driver.state.boundarystate:selected', function(event, selected) {
                ctl.boundaryId = selected.uuid;
                loadRecords();
            });
        }

        function loadRecords() {
            // TODO: implement filtering by polygon_id on the server side
            RecordAggregates.recentCounts(ctl.boundaryId).then(function(aggregate) {
                ctl.year = aggregate.year;
                ctl.quarter = aggregate.quarter;
                ctl.month = aggregate.month;
            });
        }
    }

    angular.module('driver.recentCounts')
      .controller('RecentCountsController', RecentCountsController);

})();

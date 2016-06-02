(function () {
    'use strict';

    /* ngInject */
    function RecentCountsController($scope, InitialState, RecordAggregates, RecordState) {
        var ctl = this;
        InitialState.ready().then(init);
        return ctl;

        function init() {
            RecordState.getSelected()
                .then(function(recordType) {
                    /* jshint camelcase: false */
                    ctl.recordTypePlural = recordType.plural_label;
                    /* jshint camelcase: true */
                    loadRecords();
                });

            $scope.$on('driver.state.boundarystate:selected', function() {
                loadRecords();
            });
        }

        function loadRecords() {
            RecordAggregates.recentCounts().then(function(aggregate) {
                ctl.year = aggregate.year;
                ctl.quarter = aggregate.quarter;
                ctl.month = aggregate.month;
            });
        }
    }

    angular.module('driver.recentCounts')
      .controller('RecentCountsController', RecentCountsController);

})();

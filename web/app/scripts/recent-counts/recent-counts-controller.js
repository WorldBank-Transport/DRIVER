(function () {
    'use strict';

    /* ngInject */
    function RecentCountsController($scope, RecordAggregates, RecordState) {
        var ctl = this;
        init();
        $scope.$on('driver.state.recordstate:selected', init);
        return ctl;

        function init() {
            RecordState.getSelected().then(function(recordType) {
                /* jshint camelcase: false */
                ctl.recordTypePlural = recordType.plural_label;
                RecordAggregates.recentCounts().then(function(aggregate) {
                    ctl.year = aggregate.year;
                    ctl.quarter = aggregate.quarter;
                    ctl.month = aggregate.month;
                });
                /* jshint camelcase: true */
            });
        }
    }

    angular.module('driver.recentCounts')
      .controller('RecentCountsController', RecentCountsController);

})();

(function () {
    'use strict';

    /* ngInject */
    function RecentCountsController($log, $scope, RecordAggregates) {
        var ctl = this;
        init();
        $scope.$on('driver.state.recordstate:selected', init);
        return ctl;


        function init() {
            /* jshint camelcase: false */
            RecordAggregates.recentCounts().then(function(aggregate) {
                ctl.record_type_plural = aggregate.plural;
                ctl.year = aggregate.year;
                ctl.quarter = aggregate.quarter;
                ctl.month = aggregate.month;
            });
            /* jshint camelcase: true */
        }
    }

    angular.module('driver.recentCounts')
    .controller('RecentCountsController', RecentCountsController);

})();

(function () {
    'use strict';

    /* ngInject */
    function RecentCountsController($scope, RecordAggregates) {
        var ctl = this;
        init();
        $scope.$on('driver.state.recordstate:selected', init);
        return ctl;

        function init() {
            /* jshint camelcase: false */
            RecordAggregates.recentCounts().then(function(aggregate) {
                ctl.recordTypePlural = aggregate.plural;
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

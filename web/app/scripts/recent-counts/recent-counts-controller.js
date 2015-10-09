(function () {
    'use strict';

    /* ngInject */
    function RecentCountsController($log) {
        var ctl = this;

        ctl.record_type_plural = 'Bird Catastrophes';
        ctl.year = "lots and lots";
        ctl.quarter = 'bunches';
        ctl.month = 'relatively few';
        return ctl;
    }

    angular.module('driver.recentCounts')
    .controller('RecentCountsController', RecentCountsController);

})();

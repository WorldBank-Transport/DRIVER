(function () {
    'use strict';

    /* ngInject */
    function CustomReportController($state, $stateParams, Records, AggregationsConfig) {
        var ctl = this;
        ctl.dateFormat = 'MMM D, YYYY';
        init();

        function init() {
            ctl.params = $stateParams;

            getCategoryLabels().then(function () {
                Records.report(ctl.params).$promise.then(function (report) {
                    ctl.report = report;
                });
            });
        }

        function getCategoryLabels() {
            return AggregationsConfig.getOptions().then(function (options) {
                /* jshint camelcase: false */
                var rowCategory = _.find(options, function (filter) {
                    return [ctl.params.row_period_type,
                            ctl.params.row_boundary_id,
                            ctl.params.row_choices_path].indexOf(filter.value) >= 0;
                    });
                ctl.rowCategoryLabel = rowCategory.label;

                var colCategory = _.find(options, function (filter) {
                    return [ctl.params.col_period_type,
                            ctl.params.col_boundary_id,
                            ctl.params.col_choices_path].indexOf(filter.value) >= 0;
                    });
                ctl.colCategoryLabel = colCategory.label;
                /* jshint camelcase: true */
            });
        }
    }

    angular.module('driver.customReports')
    .controller('CustomReportController', CustomReportController);

})();

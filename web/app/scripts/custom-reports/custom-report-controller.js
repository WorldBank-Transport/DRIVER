(function () {
    'use strict';

    /* Custom report view.  Receives filter and aggregation parameters via $stateParams,
     * gets a report from the API and displays it.
     *
     * The HTML for the table body and column header is built as a string here in the controller,
     * because ng-repeat is too slow.
     */

    /* ngInject */
    function CustomReportController($state, $stateParams, Records, AggregationsConfig) {
        var ctl = this;
        ctl.dateFormat = 'MMM D, YYYY';
        init();

        function init() {
            ctl.loading = true;
            ctl.params = $stateParams;

            getCategoryLabels().then(function () {
                return Records.report(ctl.params).$promise;
            }).then(function (report) {
                console.log('report ready');
                ctl.report = report;
                composeTables();
                ctl.loading = false;
            });
        }

        // Gets text labels for the row and column categories by looking up the given parameters
        // in the options list that was presented on the report generation modal.
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

        // Since ng-repeat is so slow, this builds the table HTML by hand, which then gets
        // crammed right into the view with a <table-data-string> directive.
        function composeTables() {
            /* jshint camelcase: false */
            var header = '<tr><th>' + ctl.rowCategoryLabel + '</th>';
            _.forEach(ctl.report.col_labels, function(col) {
                header += '<th>' + col.label + '</th>'; });
            header += '<th>Total</th>' + '</tr>';
            ctl.headerHTML = header;

            _.forEach(ctl.report.tables, function (table) {
                var body = '';
                _.forEach(ctl.report.row_labels, function (rowLabel) {
                    body += '<tr><td>' + rowLabel.label + '</td>';
                    if (table.data[rowLabel.key]) {
                        _.forEach(ctl.report.col_labels, function (colLabel) {
                            body += '<td>' + (table.data[rowLabel.key][colLabel.key] || 0) + '</td>';
                        });
                        body += '<td>' + table.row_totals[rowLabel.key] + '</td>';
                    } else {
                        _.forEach(ctl.report.col_labels, function () {
                            body += '<td>0</td>';
                        });
                        body += '<td>0</td>';
                    }
                    body += '</tr>';
                });
                table.bodyHTML = body;
            });
        }
    }

    angular.module('driver.customReports')
    .controller('CustomReportController', CustomReportController);

})();

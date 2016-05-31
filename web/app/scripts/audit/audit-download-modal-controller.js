(function () {
    'use strict';

    /* ngInject */
    function AuditDownloadModalController($modalInstance, $scope, $translate, WebConfig, AuditLogs,
                                          FileSaver, Blob) {
        var defaultDate = new Date();
        var timeZone = WebConfig.localization.timeZone;
        var ctl = this;

        // TODO: revisit when implementing Hijri calendar.
        // These translations will probably also be sufficient the Hijri calendar, since there are
        // also 12 months, but the date calculalation logic below will likely need to be altered.
        var monthList = [
            'MONTH.JANUARY',
            'MONTH.FEBRUARY',
            'MONTH.MARCH',
            'MONTH.APRIL',
            'MONTH.MAY',
            'MONTH.JUNE',
            'MONTH.JULY',
            'MONTH.AUGUST',
            'MONTH.SEPTEMBER',
            'MONTH.OCTOBER',
            'MONTH.NOVEMBER',
            'MONTH.DECEMBER'
        ];

        initialize();

        function initialize() {
            ctl.pending = false;
            ctl.error = null;
            ctl.months = monthList;
            ctl.currentYear = defaultDate.getFullYear();
            ctl.currentMonth = defaultDate.getMonth();
            ctl.selectedYear = ctl.currentYear;
            ctl.selectedMonth = ctl.currentMonth;
            onDateChange();

            ctl.onDateChange = onDateChange;
            ctl.onDownloadClicked = onDownloadClicked;
            ctl.close = function () {
                $modalInstance.close();
            };
        }

        function onDateChange() {
            ctl.error = null;
            if (ctl.selectedYear === ctl.currentYear) {
                ctl.months = _.slice(monthList, 0, ctl.currentMonth + 1);
                if (ctl.selectedMonth >= ctl.months.length) {
                    ctl.selectedMonth = ctl.months.length - 1;
                }
            } else {
                ctl.months = monthList;
            }
        }

        function onDownloadClicked() {
            ctl.pending = true;
            var year = ctl.selectedYear;
            var month = ctl.selectedMonth;
            // Months are 1-indexed in the API; zero-indexed in the menu.
            var apiMonth = month + 1;
            // From http://stackoverflow.com/questions/315760/what-is-the-best-way-to-determine-the-number-of-days-in-a-month-with-javascript
            // This is a bit subtle; it gets the last day of the previous month. This *seems*
            // wrong, since we want the number of days in apiMonth, but since Javascript's months
            // are zero-indexed, it works out for one-indexed dates. So if the current month is
            // February, apiMonth will be 2, which to the Javascript API is *March*. It will then
            // return the last day of the month previous to March, which is the last day of
            // February.
            var daysInMonth = (new Date(year, apiMonth, 0)).getDate();
            var startDate = moment.tz([year, month], timeZone).toISOString();
            var endDate = moment.tz([year, month, daysInMonth, 23, 59, 59, 999],
                                    timeZone).toISOString();
            /* jshint camelcase: false */
            AuditLogs.csv({ min_date: startDate, max_date: endDate }).$promise.then(function (data) {
                /* jshint camelcase: true */
                if (data.data === '') {
                    ctl.error = $translate.instant('ERRORS.NO_AUDIT_RECORDS');
                } else {
                    FileSaver.saveAs(new Blob([data.data], {type: 'application/csv'}),
                                     csvFilename(year, apiMonth));
                }
                ctl.pending = false;
            });
        }

        function csvFilename(year, month) {
            return 'audit-log-' + month + '-' + year + '.csv';
        }
    }

    angular.module('driver.audit')
    .controller('AuditDownloadModalController', AuditDownloadModalController);

})();

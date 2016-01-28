(function () {
    'use strict';

    /* ngInject */
    function AuditDownloadModalController($modalInstance, WebConfig) {
        var defaultDate = new Date();
        var timeZone = WebConfig.localization.timeZone;
        var ctl = this;

        ctl.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                      'September', 'October', 'November', 'December'];
        ctl.selectedYear = defaultDate.getFullYear();
        ctl.selectedMonth = defaultDate.getMonth().toString();
        onDateChange(ctl.selectedYear, ctl.selectedMonth);
        ctl.onDateChange = onDateChange;
        ctl.close = function () {
            $modalInstance.close();
        };

        function makeDateQueryStr(year, month) {
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
            var startDate = moment.tz([year, month], timeZone);
            var endDate = moment.tz([year, month, daysInMonth, 23, 59, 59, 999], timeZone);
            return 'min_date=' + startDate.toISOString() + '&max_date=' + endDate.toISOString();
        }

        function onDateChange(year, month) {
            var monthNum = parseInt(month, 10);
            ctl.dateQueryStr = makeDateQueryStr(year, monthNum);
        }
    }

    angular.module('driver.audit')
    .controller('AuditDownloadModalController', AuditDownloadModalController);

})();

(function () {
    'use strict';

    /* ngInject */
    function CustomReportController($state, $stateParams, Records) {
        var ctl = this;
        init();

        function init() {
            var params = $stateParams;
            Records.report(params).$promise.then(function (report) {
                ctl.report = report;
            });
        }
    }

    angular.module('driver.customReports')
    .controller('CustomReportController', CustomReportController);

})();

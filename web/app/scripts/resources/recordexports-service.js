(function () {
    'use strict';

    /**
     * Service for creating and downloading record exports.
     * exportCSV takes a tilekey and initiates an export then polls for the result, returning
     * a promise that either resolves with a download URL or rejects with an error message.
     */

    /* ngInject */
    function RecordExports($resource, $q, $translate, $interval, WebConfig) {
        var pollingInterval;
        var POLLING_INTERVAL_MS = 1500;
        var MAX_POLLING_TIME_S = 100;

        var Exports = $resource(WebConfig.api.hostname + '/api/csv-export/:id/', {id: '@uuid'}, {
            create: {
                method: 'POST'
            },
            get: {
                method: 'GET'
            }
        });

        var module = {
            exportCSV: exportCSV,
            cancelPolling: cancelPolling
        };
        return module;

        function exportCSV(tilekey) {
            cancelPolling();
            var deferred = $q.defer();

            Exports.create({ tilekey: tilekey },
                function (result) {
                    var taskID = result.taskid;
                    pollingInterval = $interval(
                        function () {
                            Exports.get({ id: taskID }).$promise.then(function (response) {
                                switch (response.status) {
                                    case 'PENDING':
                                        break;
                                    case 'STARTED':
                                        break;
                                    case 'FAILURE':
                                        deferred.reject(response.error);
                                        cancelPolling();
                                        break;
                                    case 'SUCCESS':
                                        deferred.resolve(response.result);
                                        cancelPolling();
                                        break;
                                }
                            });
                        },
                        POLLING_INTERVAL_MS,
                        MAX_POLLING_TIME_S * 1000 / POLLING_INTERVAL_MS
                    );
                    // The interval's promise resolves if it hits the limit without being cancelled
                    pollingInterval.then(function () {
                        cancelPolling();
                        deferred.reject($translate.instant('ERRORS.EXPORT_TIMED_OUT'));
                    });
                },
                function () {
                    deferred.reject($translate.instant('ERRORS.EXPORT_INITIALIZATION_ERROR'));
                }
            );
            return deferred;
        }

        function cancelPolling() {
            $interval.cancel(pollingInterval);
        }
    }

    angular.module('driver.resources')
    .factory('RecordExports', RecordExports);

})();

/**
 * Service that keeps track of state for objects that are required to be available
 * upon page load. This is used to ensure the common state values used within each
 * component are fully loaded before pages make requests, preventing state problems.
 */
(function () {
    'use strict';

    /* ngInject */
    function InitialState($log, $q) {

        var recordTypeInitialized = false;
        var boundaryInitialized = false;
        var geographyInitialized = false;

        var deferreds = [];

        var svc = {
            ready: ready,
            setRecordTypeInitialized: setRecordTypeInitialized,
            setBoundaryInitialized: setBoundaryInitialized,
            setGeographyInitialized: setGeographyInitialized
        };

        return svc;

        /**
         * Returns a promise that resolves when all state values are available
         */
        function ready() {
            var deferred = $q.defer();

            if (allInitialized()) {
                deferred.resolve();
            } else {
                deferreds.push(deferred);
            }

            return deferred.promise;
        }

        /**
         * Checks if all state values are available, and if so, resolves all deferreds
         */
        function resolveDeferreds() {
            if (allInitialized()) {
                _.each(deferreds, function(deferred) {
                    deferred.resolve();
                });
                deferreds = [];
            }
        }

        /**
         * Returns true when all state values are available
         */
        function allInitialized() {
            return recordTypeInitialized && boundaryInitialized && geographyInitialized;
        }

        /**
         * Sets the recordType initialized state value to true
         */
        function setRecordTypeInitialized() {
            recordTypeInitialized = true;
            resolveDeferreds();
        }

        /**
         * Sets the boundary initialized state value to true
         */
        function setBoundaryInitialized() {
            boundaryInitialized = true;
            resolveDeferreds();
        }

        /**
         * Sets the geography initialized state value to true
         */
        function setGeographyInitialized() {
            geographyInitialized = true;
            resolveDeferreds();
        }

    }

    angular.module('driver.state')
    .factory('InitialState', InitialState);
})();

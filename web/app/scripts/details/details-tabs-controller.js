(function () {
    'use strict';

    /* ngInject */
    function DetailsTabsController(Records, $q, $rootScope, $scope) {
        var ctl = this;
        ctl.sortedDefinitions = sortDefinitions();
        ctl.sortedProperties = sortedProperties;

        // Cancel pending record request, if any, when view closed
        $scope.$on('$destroy', function() {
            if ($rootScope.pendingRecordRequest) {
                $rootScope.pendingRecordRequest.resolve();
            }
        });

        function getFullRecord() {
            // for users with full record access, go fetch all the other sections of the record
            if (ctl.userCanWrite) {
                // Promise that may be used to cancel the full record query.
                // Kept on root scope so that it will still be present in scope's $destroy.
                $rootScope.pendingRecordRequest = $q.defer();

                Records.get({
                    id: ctl.record.uuid,
                    timeout: $rootScope.pendingRecordRequest.promise})
                .$promise.then(function(record) {
                    ctl.record = record;
                    ctl.sortedDefinitions = _.map(ctl.sortedDefinitions, function(definition) {
                        definition.pending = false;
                        return definition;
                    });
                });
            }
        }

        function sortDefinitions() {
            // get the section names, sorted by propertyOrder
            var ordering = _(ctl.recordSchema.schema.properties)
                .sortBy(function(obj, key) {
                    obj.propertyName = key;
                    return (obj.propertyOrder !== undefined) ? obj.propertyOrder : 99;
                })
                .map(function(obj) {
                    return obj.propertyName;
                })
                .value();


            // get section definitions as sorted array, with added property for the section name
            var sorted = _.map(ordering, function(section) {
                var definition = ctl.recordSchema.schema.definitions[section];
                definition.propertyName = definition.title;
                definition.propertyKey = section;
                // only set to pending if not details section and user not public
                definition.pending = !definition.details && ctl.userCanWrite;
                return definition;
            });

            getFullRecord();
            return sorted;
        }

        // Returning an array of definition properties sorted by propertyOrder
        function sortedProperties(properties) {
            return _(properties)
                .omit('_localId')
                .map(function(obj, propertyName) {
                    // The object is being converted to an array, so preserve the property name
                    obj.propertyName = propertyName;
                    return obj;
                })
                .sortBy('propertyOrder')
                .value();
        }
    }

    angular.module('driver.details')
    .controller('DetailsTabsController', DetailsTabsController);

})();

/**
 * Record Type state control - changes to the private vars which define this state
 *  are broadcast to rootscope for use by controllers
 */
(function () {
    'use strict';

    /* ngInject */
    function RecordSchemaState($log, $rootScope, $q, localStorageService,
                               RecordSchemas) {
        var selected,
            gettingSelected,
            selectedPromise,
            lastChosen;
        var svc = this;
        svc.get = get;
        svc.getFilterables = getFilterables;
        init();

        /**
         * initialization
         */
        function init() {
          selected = null;
          gettingSelected = false;
        }


        /**
         * Helper function to get a list of all filterable items for the provided schemaID
         *
         * @param schemaID {string} The Schema UUID for which filterables are sought
         */
        function getFilterables(schemaID) {
            var deferred = $q.defer();
            get(schemaID).then(function(schema) {
                // Falling back on the empty object is necessary only for testing
                var definitions;
                if (schema.schema && schema.schema.definitions) {
                    definitions = schema.schema.definitions;
                } else {
                    definitions = {};
                }

                var namespaced = {};
                _.forEach(definitions, function(schema, i) {
                    _.forEach(schema.properties, function(property, j) {
                        // merge in `multiple` to keep track of the type of containment
                        namespaced[i + '#' + j] = _.merge(property, {multiple: schema.multiple});
                    });
                });

                var conditions = function(val) { return val.isSearchable; };
                var filterables = {};
                _.forEach(namespaced, function(d, i) {
                    if (conditions(d)) {
                        filterables[i] = d;
                    }
                });
                deferred.resolve(filterables);

            });
            return deferred.promise;
        }


        /**
         * Wrapper (with super simple caching) for getting the record schema
         *
         * @param schemaID {string} The Schema UUID for which filterables are sought
         */
        function get(schemaID) {
            if (!gettingSelected || schemaID !== lastChosen) {
                gettingSelected = true;
            } else {
                return selectedPromise;
            }
            lastChosen = schemaID;

            var deferred = $q.defer();
            if (!selected) {
                RecordSchemas.get({ id: schemaID }).$promise.then(function(schema) {
                    if (schema.results) {
                        selected = schema.results[schema.results.length-1];
                    } else {
                        selected = schema;
                    }
                    deferred.resolve(selected);
                });
            } else {
                deferred.resolve(selected);
            }
            selectedPromise = deferred.promise;

            selectedPromise.then(function() { gettingSelected = false; });
            return selectedPromise;
        }

        return svc;
    }

    angular.module('driver.state')
    .factory('RecordSchemaState', RecordSchemaState);
})();

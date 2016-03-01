(function () {
    'use strict';

    /* ngInject */
    function DetailsTabsController() {
        var ctl = this;
        ctl.sortedDefinitions = sortedDefinitions;
        ctl.sortedProperties = sortedProperties;

        function sortedDefinitions() {
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
                return definition;
            });
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

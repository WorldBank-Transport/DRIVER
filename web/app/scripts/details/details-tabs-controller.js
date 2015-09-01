(function () {
    'use strict';

    /* ngInject */
    function DetailsTabsController() {
        var ctl = this;
        ctl.sortedDefinitions = sortedDefinitions;
        ctl.sortedProperties = sortedProperties;

        // Sorts definitions alphabetically, and puts the details definition first
        function sortedDefinitions() {
            return _(ctl.recordSchema.schema.definitions)
                .toArray()
                .sortByAll(['details', 'plural_title'])
                .value();
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

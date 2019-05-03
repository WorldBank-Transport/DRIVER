(function () {
    'use strict';

    function DetailsReferenceController() {
        var ctl = this;

        // Find the referenced object
        if (ctl.record) {
            // Scan through all items in the schema to find the matching reference
            // by its _localId. The only piece of information we need about this
            // reference is it's index, so it can be used in the auto-incrementing label.
            var candidateIndices = _(ctl.record.data).toArray().filter(function(obj) {
                return Array.isArray(obj) && obj.length > 0;
            }).map(function(arr) {
                return _.findIndex(arr, { _localId: ctl.data });
            }).value();

            // There will only ever be one matching index. All other related info objects will
            // have a -1 populated here, so we can just take the maxiumum of the array
            var index = _.max(candidateIndices);
            if (index > -1) {
                // Property name of the target
                var targetKey = ctl.property.watch.target;

                // Single title of the referenced target
                var singleTitle = ctl.recordSchema.schema.definitions[targetKey].title;

                ctl.referenceDisplay = singleTitle + ' ' + (index + 1);
            }
        }
    }

    angular.module('driver.details')
    .controller('DetailsReferenceController', DetailsReferenceController);

})();

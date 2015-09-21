(function () {
    'use strict';

    /* ngInject */
    function DetailsReferenceController() {
        var ctl = this;

        // Find the referenced object
        if (ctl.record) {
            var references = _(ctl.record.data)
                    .toArray()
                    .flatten()
                    .where({ _localId: ctl.data })
                    .value();

            // Construct a display label based on the properties of the referenced object
            if (references.length) {
                var reference = references[0];
                var keys = _.without(_.keys(reference), '_localId', '$$hashKey');
                var maxKeyLength = 12;
                ctl.referenceDisplay = _.map(keys.slice(0, 3), function(key) {
                    if (reference[key].length < maxKeyLength) {
                        return reference[key];
                    }
                    return reference[key].substring(0, maxKeyLength) + '...';
                }).join(' ');
            }
        }
    }

    angular.module('driver.details')
    .controller('DetailsReferenceController', DetailsReferenceController);

})();

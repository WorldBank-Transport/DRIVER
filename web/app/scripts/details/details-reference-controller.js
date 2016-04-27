(function () {
    'use strict';

    /* ngInject */
    function DetailsReferenceController($translate) {
        var ctl = this;

        var ellipsis = $translate.instant('COMMON.ELLIPSIS');

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
                    // TODO: do we need to make changes for any displayed substrings
                    // (and limitTo filters) in the app for right-to-left languages?
                    return reference[key].substring(0, maxKeyLength) + ellipsis;
                }).join(' ');
            }
        }
    }

    angular.module('driver.details')
    .controller('DetailsReferenceController', DetailsReferenceController);

})();

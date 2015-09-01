(function () {
    'use strict';

    /* ngInject */
    function DetailsReferenceController() {
        var ctl = this;

        // Find the referenced object
        var references = _(ctl.record.data)
            .toArray()
            .flatten()
            .where({ _localId: ctl.data })
            .value();

        // Construct a display label based on the properties of the referenced object
        if (references.length) {
            var reference = references[0];
            var keys = _.without(_.keys(reference), '_localId', '$$hashKey');
            ctl.referenceDisplay = _.map(keys.slice(0, 3), function(key) {
                return reference[key];
            }).join(' ');
        }
    }

    angular.module('driver.details')
    .controller('DetailsReferenceController', DetailsReferenceController);

})();

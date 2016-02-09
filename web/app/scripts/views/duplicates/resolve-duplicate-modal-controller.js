(function () {
    'use strict';

    /* ngInject */
    function ResolveDuplicateModalController($modalInstance, Duplicates, Records, params) {
        var ctl = this;
        ctl.params = params;
        ctl.selectRecord = selectRecord;
        ctl.keepBoth = keepBoth;
        ctl.close = close;

        function selectRecord (recordUUID) {
            Duplicates.resolve({uuid: ctl.params.duplicate.uuid, recordUUID: recordUUID}).$promise.then(
                function (result) {
                    // Since resolving one duplicate can cause others to be resolved, search the
                    // list and update any that were resolved (including the intended one).
                    _.forEach(ctl.params.duplicatesList, function (dup) {
                        if (_.any(result.resolved, function (resolvedUUID) {
                                return resolvedUUID === dup.uuid; } )) {
                            dup.resolved = true;
                        }
                    });
                    ctl.close();
                }
            );
        }

        function keepBoth () {
            Duplicates.resolve({uuid: ctl.params.duplicate.uuid}).$promise.then(
                function () {
                    ctl.params.duplicate.resolved = true;
                    ctl.close();
                }
            );
        }

        ctl.close = function () {
            $modalInstance.close();
        };
    }

    angular.module('driver.views.duplicates')
    .controller('ResolveDuplicateModalController', ResolveDuplicateModalController);

})();

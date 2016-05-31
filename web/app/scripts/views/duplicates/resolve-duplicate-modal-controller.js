(function () {
    'use strict';

    /* ngInject */
    function ResolveDuplicateModalController($modalInstance, $modal, Duplicates, Records, params) {
        var ctl = this;
        ctl.params = params;
        ctl.selectRecord = selectRecord;
        ctl.keepBoth = keepBoth;
        ctl.close = $modalInstance.close;
        ctl.dismiss = $modalInstance.dismiss;

        // Show a confirmation modal when picking a record
        function showConfirmationModal() {
            return $modal.open({
                templateUrl: 'scripts/views/duplicates/resolve-duplicate-confirmation-modal-partial.html',
                size: 'sm',
                backdrop: 'static',
                windowClass: 'confirmation-modal'
            });
        }

        function selectRecord (recordUUID) {
            return showConfirmationModal().result.then(function () {
                return Duplicates.resolve({uuid: ctl.params.duplicate.uuid, recordUUID: recordUUID})
                    .$promise.then(function(result) {
                        ctl.close(result);
                    }
                );
            });
        }

        function keepBoth () {
            return Duplicates.resolve({uuid: ctl.params.duplicate.uuid}).$promise.then(
                function (result) {
                    ctl.close(result);
                }
            );
        }
    }

    angular.module('driver.views.duplicates')
    .controller('ResolveDuplicateModalController', ResolveDuplicateModalController);

})();

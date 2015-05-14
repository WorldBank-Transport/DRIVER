(function () {
    'use strict';

    /* ngInject */
    function BoundaryAddController($state, Boundaries, Upload, Config) {
        var ctl = this;
        initialize();

        /**
         * Callback which routes responses on error to the appropriate dialog
         */
        function geoUploadErrorCB(data, status) {
            ctl.uploadState = 'upload-error';
            if (status === 409) {
                ctl.errorText = 'Uniqueness violation - verify that your geography label is unique';
            } else {
                ctl.errorText = 'Error - check that your upload is a valid shapefile';
            }
        }

        /**
         * Uploads shapefile to be processed on the backend - thus allowing us to list the possible
         *  display fields
         */
        ctl.geoUpload = function() {
            function successCB(data, status) {
                if (data.status === 'COMPLETE') {
                    ctl.serverBoundaryFields = data;
                    ctl.fileUploaded = true;
                    ctl.uploadState = 'upload-success';
                    ctl.fields = data.data_fields;
                } else if (status === 'ERROR') {
                }
            }
            ctl.uploadState = 'requesting';
            Boundaries.create(ctl.files,
                              ctl.boundaryFields.label,
                              ctl.boundaryFields.color,
                              successCB,
                              geoUploadErrorCB);
        };

        /**
         * Updates geometry - primarily used for adding a display field
         */
        ctl.geoUpdate = function() {
            var updated_fields = angular.extend(ctl.serverBoundaryFields, ctl.boundaryFields);
            delete(updated_fields.source_file);
            var bounds = new Boundaries(updated_fields);
            var updateRequest = bounds.$update();
            ctl.uploadState = 'requesting';
            updateRequest.then(function(res) {
                ctl.uploadState = 'update-success';
                ctl.serverSays = res;
            }, geoUploadErrorCB);
        };

        /**
         * Cancel button - tell the backend to delete whatever was created (if something was) and
         *  carry out a UI refresh
         */
        ctl.cancel = function() {
            if (ctl.serverBoundaryFields) {
                var deletionRequest = Boundaries.remove({uuid: ctl.serverBoundaryFields.uuid});
                deletionRequest.$promise.then(function() {
                    $state.go($state.$current, null, { reload: true });
                });
            } else {
                $state.go($state.$current, null, { reload: true });
            }

            // Reinitialize page
        };


        function initialize() {
            ctl.fileUploaded = false;
            ctl.uploadState = '';
            ctl.files = [];
            ctl.colors = ['Red', 'Blue', 'Green'];
        }
    }

    angular.module('ase.views.boundary')
    .controller('BoundaryAddController', BoundaryAddController);
})();

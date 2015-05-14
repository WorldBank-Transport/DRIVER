(function () {
    'use strict';

    /* ngInject */
    function GeographyAddController($state, Geography) {
        var ctl = this;
        initialize();

        /**
         * Callback which routes responses on error to the appropriate dialog
         */
        function geoUploadErrorCB(data, status) {
            ctl.uploadState = 'upload-error';
            ctl.errorMessage = Geography.errorMessage(status);
        }

        /**
         * Uploads shapefile to be processed on the backend - thus allowing us to list the possible
         *  display fields
         */
        ctl.geoUpload = function() {
            function successCB(data) {
                if (data.status === 'COMPLETE') {
                    ctl.serverGeoFields = data;
                    ctl.fileUploaded = true;
                    ctl.uploadState = 'upload-success';
                    ctl.fields = data.data_fields;
                }
            }
            ctl.uploadState = 'requesting';
            Geography.create(ctl.files,
                              ctl.geoFields.label,
                              ctl.geoFields.color,
                              successCB,
                              geoUploadErrorCB);
        };

        /**
         * Updates geometry - primarily used for adding a display field
         */
        ctl.geoUpdate = function() {
            var updated_fields = angular.extend(ctl.serverGeoFields, ctl.geoFields);
            delete(updated_fields.source_file);
            var geo = new Geography(updated_fields);
            var updateRequest = geo.$update();
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
            if (ctl.serverGeoFiels) {
                var deletionRequest = Geography.remove({uuid: ctl.serverGeoFields.uuid});
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

    angular.module('ase.views.geography')
    .controller('GeoAddController', GeographyAddController);
})();

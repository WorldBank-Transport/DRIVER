(function () {
    'use strict';

    /* ngInject */
    function BoundaryAddController($state, Boundaries, Upload, Config) {
        var ctl = this;
        initialize();

        /**
         * Uploads shapefile to be processed on the backend - thus allowing us to list the possible
         *  display fields
         */
        ctl.geoUpload = function(valid) {
            function callback(data, status, headers, config) {
                if (data.status === 'COMPLETE') {
                    ctl.serverBoundaryFields = data;
                    ctl.fileUploaded = true;
                    ctl.uploadState = 'upload-success';
                    ctl.fields = data.data_fields;
                } else if (data.status === 'ERROR') {
                    ctl.uploadState = 'upload-error';
                }
            }
            ctl.uploadState = 'requesting';
            Boundaries.create(ctl.files, ctl.boundaryFields.label, ctl.boundaryFields.color, callback);
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
            }, function(res) {
                ctl.uploadState = 'update-error';
                ctl.serverSays = res;
            });

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

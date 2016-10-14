(function () {
    'use strict';

    /* ngInject */
    function GeographyAddController($state, Geography, Notifications) {
        var ctl = this;
        initialize();

        /**
         * Callback which routes responses on error to the appropriate dialog
         */
        function geoUploadErrorCB(data, status) {
            ctl.uploadState = 'upload-error';
            Notifications.show({text: Geography.errorMessage(status),
                                displayClass: 'alert-danger'});
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
                    Notifications.show({text: 'Geography upload successful! Select a primary field below.',
                                        displayClass: 'alert-success'});
                    /* jshint camelcase: false */
                    ctl.fields = data.data_fields;
                    /* jshint camelcase: true */
                } else if (data.status === 'ERROR') {
                    ctl.uploadState = 'upload-error';
                    Notifications.show({text: 'Error - check that your upload is a valid shapefile',
                                        displayClass: 'alert-danger'});
                }
            }
            ctl.uploadState = 'requesting';
            Notifications.show({text: 'Loading...'});
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
            /* jshint camelcase: false */
            var updated_fields = angular.extend(ctl.serverGeoFields, ctl.geoFields);
            delete(updated_fields.source_file);
            var geo = new Geography(updated_fields);
            /* jshint camelcase: true */
            var updateRequest = geo.$update();
            ctl.uploadState = 'requesting';
            Notifications.show({text: 'Loading...'});
            updateRequest.then(function(res) {
                ctl.uploadState = 'update-success';
                Notifications.show({text: 'Geography update successful!',
                                    displayClass: 'alert-success'});
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
            Notifications.show({text: 'Upload your zipped shapefile; once uploaded, ' +
                                      'select a primary field for display',
                                displayClass: 'alert-info'});
            ctl.files = [];
            ctl.colors = ['red', 'blue', 'green'];
        }
    }

    angular.module('ase.views.geography')
    .controller('GeoAddController', GeographyAddController);
})();

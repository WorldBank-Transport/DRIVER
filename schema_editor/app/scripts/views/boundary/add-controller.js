(function () {
    'use strict';

    /* ngInject */
    function BoundaryAddController($state, Boundaries, Upload, Config) {
        var ctl = this;
        initialize();

        ctl.boundaryUpload = function() {
            function callback(data, status, headers, config) {
                if (data.status === 'COMPLETE') {
                    ctl.uploadState = 'successful-upload';
                    ctl.fields = data.data_fields;
                    ctl.serverBoundaryFields = data;
                } else if (data.status === 'ERROR') {
                    ctl.uploadState = 'invalid-shape';
                }
            }
            ctl.uploadState = 'requesting';
            Boundaries.create(ctl.files, ctl.boundaryFields.label, ctl.boundaryFields.color, callback);
        };

        ctl.boundaryUpdate = function() {
            var updated_fields = angular.extend(ctl.serverBoundaryFields, ctl.boundaryFields);
            delete(updated_fields.source_file);
            var bounds = new Boundaries(updated_fields);
            bounds.$update();
        };

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

        ctl.colors = ['Red', 'Blue', 'Green'];


        function initialize() {
          ctl.uploadState = '';
        }
    }

    angular.module('ase.views.boundary')
    .controller('BoundaryAddController', BoundaryAddController);
})();

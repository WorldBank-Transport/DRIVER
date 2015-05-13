(function () {
    'use strict';

    /* ngInject */
    function BoundaryUploadController(Boundaries, Upload, Config) {
        var ctl = this;
        initialize();

        ctl.boundaryUpload = function() {
            function callback(data, status, headers, config) {
                if (data.status === 'COMPLETE') {
                    ctl.shpValid = true;
                    ctl.fields = data.data_fields;
                    ctl.serverBoundaryFields = data;
                } else if (data.status === 'ERROR') {
                    ctl.shpInvalid = true;
                }
            }
            Boundaries.create(ctl.files, ctl.boundaryFields.label, ctl.boundaryFields.color, callback);
        };

        ctl.boundaryUpdate = function() {
            var updated_fields = angular.extend(ctl.serverBoundaryFields, ctl.boundaryFields);
            delete(updated_fields.source_file)
            var bounds = new Boundaries(updated_fields);
            bounds.$update();
        };

        ctl.colors = ['Red', 'Blue', 'Green'];


        function initialize() {
          ctl.shpValid = false;
          ctl.shpInvalid = false;
        }
    }

    angular.module('ase.views.boundary')
    .controller('BoundaryUploadController', BoundaryUploadController);
})();

(function () {
    'use strict';

    /* ngInject */
    function BoundaryEditController($stateParams, Boundaries) {
        var ctl = this;
        initialize();

        ctl.colors = ['Red', 'Blue', 'Green'];

        ctl.boundaryUpdate = function() {
            delete(ctl.workingBoundary.source_file);
            var bounds = new Boundaries(ctl.workingBoundary);

            var updateRequest = bounds.$update();
            updateRequest.then(function(res) {
                ctl.updateState = 'update-success';
                ctl.serverSays = res;
            }, function(res) {
                ctl.updateState = 'update-error';
                ctl.serverSays = res;
            });

        };

        function initialize() {
          ctl.workingBoundary = Boundaries.get({ uuid: $stateParams.uuid });
        }
    }

    angular.module('ase.views.boundary')
    .controller('BoundaryEditController', BoundaryEditController);
})();

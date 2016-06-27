(function () {
    'use strict';

    /* Enforcer Assignments view -- displays maps with an assignment for each traffic
     * enforcer specified in the parameters
     */

    /* ngInject */
    function EnforcerAssignmentsController($state, $stateParams, $q, $translate, $window,
                                           Assignments, Boundaries, Polygons) {
        var ctl = this;

        $translate.onReady(init);

        function init() {
            ctl.loading = true;
            ctl.params = $stateParams;
            ctl.dateFormat = 'long';
            ctl.printPage = printPage;
            ctl.areaName = '';

            Assignments.query(ctl.params).$promise.then(function(assignments) {
                ctl.assignments = assignments;
            },
            function (error) {
                ctl.error = error.data.detail;
            }).finally(function () {
                ctl.loading = false;
            });

            /* jshint camelcase: false */
            var polygonId = $stateParams.polygon_id;
            /* jshint camelcase: false */

            if (polygonId) {
              Polygons.get({ id: polygonId }).$promise.then(function(poly) {
                  Boundaries.get({ id: poly.boundary }).$promise.then(function(boundary) {
                      /* jshint camelcase: false */
                      ctl.areaName = poly.data[boundary.display_field];
                      /* jshint camelcase: false */
                  });
              });
            } else {
                ctl.areaName = 'Custom Polygon';
            }
        }

        function printPage() {
            $window.print();
        }
    }

    angular.module('driver.enforcers')
    .controller('EnforcerAssignmentsController', EnforcerAssignmentsController);

})();

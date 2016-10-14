(function () {
    'use strict';

    /* ngInject */
    function EnforcersModalController($log, $modalInstance, $state, $translate, $window,
                                      $timeout, FilterState, BoundaryState, GeographyState,
                                      RecordState, MapState) {

        var maxShiftLength = Math.abs(moment.duration(24, 'hours').asHours());
        var ctl = this;

        ctl.$onInit = initialize();

        function initialize() {
            ctl.ready = false;
            ctl.closeModal = closeModal;
            ctl.createAssignments = createAssignments;
            ctl.onParamChanged = onParamChanged;

            RecordState.getSelected().then(function (recordType) {
                ctl.recordType = recordType.uuid;
            });

            GeographyState.getSelected().then(function(geography) {
                BoundaryState.getSelected().then(function (boundary) {
                    if (boundary && boundary.data) {
                        ctl.polygonId = boundary.uuid;
                        /* jshint camelcase: false */
                        ctl.polygonName = boundary.data[geography.display_field];
                        /* jshint camelcase: true */
                    } else {
                        ctl.polygonId = null;
                        ctl.polygonName = null;
                    }
                });
            });

            ctl.polygon = MapState.getFilterGeoJSON();
        }

        function closeModal() {
            $modalInstance.close();
        }

        function onParamChanged() {
            // TODO: Without this, changes to the datepicker take two digest cycles to appear on
            // the controller; there is likely a better way to solve this issue, however.
            $timeout(function() {
                ctl.ready = false;
                if (ctl.shiftStart && ctl.shiftEnd && ctl.numPersonnel) {
                    var startMt = moment(ctl.shiftStart);
                    var endMt = moment(ctl.shiftEnd);
                    var dateDiff = Math.abs(moment.duration(startMt.diff(endMt)).asHours());
                    if (dateDiff > maxShiftLength) {
                        ctl.error = $translate.instant('ENFORCERS.SHIFT_LENGTH_ERROR');
                    } else {
                        ctl.error = null;
                        ctl.ready = true;
                    }
                }
            });
        }

        function createAssignments() {
            /* jshint camelcase: false */
            var params = {
                shift_start: ctl.shiftStart.toISOString(), // Format problems
                shift_end: ctl.shiftEnd.toISOString(),
                polygon_id: ctl.polygonId,
                polygon: ctl.polygon,
                record_type: ctl.recordType,
                num_personnel: ctl.numPersonnel
            };
            /* jshint camelcase: true */
            // If we were using $resource, Angular would automagically encode params that are
            // objects. But since we're using $state.href, we have to do it ourselves.
            var urlParams = _.mapValues(params, function (value) {
                if (typeof(value) === 'object' && value !== null) {
                    return angular.toJson(value);
                } else {
                    return value;
                }
            });

            $window.open($state.href('assignments', urlParams, {absolute: true}), '_blank');
        }

        return ctl;
    }

    angular.module('driver.enforcers')
    .controller('EnforcersModalController', EnforcersModalController);

})();

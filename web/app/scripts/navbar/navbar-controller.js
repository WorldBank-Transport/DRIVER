(function () {
    'use strict';

    /* ngInject */
    function NavbarController($log, $window, $rootScope, $scope, $state, $stateParams,
                              GeographyState, RecordState, PolygonState) {
        var ctl = this;
        var _ = $window._;
        init();
        ctl.onGeographySelected = onGeographySelected;
        ctl.onPolygonSelected = onPolygonSelected;
        ctl.onRecordTypeSelected = onRecordTypeSelected;
        ctl.onStateSelected = onStateSelected;
        ctl.navigateToStateName = navigateToStateName;
        ctl.getPolygonLabel = getPolygonLabel;
        $rootScope.$on('$stateChangeSuccess', setStates);

        function init() {
            ctl.geographyResults = GeographyState.getOptions();
            ctl.recordTypeResults = RecordState.getOptions();
            ctl.polygonResults = PolygonState.getOptions();
            setStates();
        }

        // Record Type selections
        $scope.$on('driver.state.recordstate:options', function(event, options) {
            ctl.recordTypeResults = options;
        });
        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            ctl.recordTypeSelected = selected;
            updateState();
        });

        // Polygon selections
        $scope.$on('driver.state.polygonstate:options', function(event, options) {
            ctl.polygonResults = options;
        });
        $scope.$on('driver.state.polygonstate:selected', function(event, selected) {
            ctl.polygonSelected = selected;
            updateState();
        });

        // Geography selections
        $scope.$on('driver.state.geographystate:options', function(event, options) {
            ctl.geographyResults = options;
        });
        $scope.$on('driver.state.geographystate:selected', function(event, selected) {
            // Need to get the new list of polygons for the selected geography
            PolygonState.updateOptions({'boundary': selected.uuid}).then(function() {
                PolygonState.setSelected();
            });
            ctl.geographySelected = selected;
            updateState();
        });

        // Sets states that can be navigated to (exclude current state, since we're already there)
        function setStates() {
            ctl.stateSelected = $state.current;
            ctl.availableStates = _.chain($state.get())
                .map(function(name) { return $state.get(name); })
                .filter(function(state) {
                    return state.showInNavbar && state.name !== $state.current.name;
                })
                .value();
        }

        // Updates the ui router state based on selected navigation parameters
        function updateState() {
            if (ctl.stateSelected && ctl.geographySelected && ctl.polygonSelected) {
                $state.go(ctl.stateSelected.name, {
                    rtuuid: ctl.recordTypeSelected.uuid,
                    geouuid: ctl.geographySelected.uuid,
                    polyuuid: ctl.polygonSelected.id
                });
            }
        }

        // Handler for when a geography is selected from the dropdown
        function onGeographySelected(geography) {
            GeographyState.setSelected(geography);
        }

        // Handler for when a polygon is selected from the dropdown
        function onPolygonSelected(polygon) {
            PolygonState.setSelected(polygon);
        }

        // Handler for when a record type is selected from the dropdown
        function onRecordTypeSelected(recordType) {
            RecordState.setSelected(recordType);
        }

        // Handler for when a navigation state is selected from the dropdown
        function onStateSelected(navState) {
            ctl.stateSelected = navState;
            updateState();
        }

        // Handler for when a navigation state is selected from the dropdown
        function navigateToStateName(stateName) {
            onStateSelected($state.get(stateName));
        }

        // Returns the label for a polygon, based on the currently selected geography
        // TODO: this should eventually be moved to an angular filter if needed elsewhere
        function getPolygonLabel(polygon) {
            if (!polygon || !polygon.properties || !polygon.properties.data || !ctl.geographySelected) {
                return '';
            }
            /* jshint camelcase: false */
            return polygon.properties.data[ctl.geographySelected.display_field];
            /* jshint camelcase: true */
        }
    }

    angular.module('driver.navbar')
    .controller('NavbarController', NavbarController);

})();

(function () {
    'use strict';

    /* ngInject */
    function NavbarController($log, $window, $rootScope, $scope, $state,
                              BoundaryState, GeographyState, InitialState,
                              RecordState, WebConfig) {
        var ctl = this;
        var initialized = false;

        InitialState.ready().then(init);
        ctl.onGeographySelected = onGeographySelected;
        ctl.onBoundarySelected = onBoundarySelected;
        ctl.onRecordTypeSelected = onRecordTypeSelected;
        ctl.onStateSelected = onStateSelected;
        ctl.navigateToStateName = navigateToStateName;
        ctl.getBoundaryLabel = getBoundaryLabel;
        ctl.recordTypesVisible = WebConfig.recordType.visible;
        $rootScope.$on('$stateChangeSuccess', setStates);

        function init() {
            setFilters($state.current);
            GeographyState.getOptions().then(function(opts) { ctl.geographyResults = opts; });
            RecordState.getOptions().then(function(opts) { ctl.recordTypeResults = opts; });
            setStates();
            initialized = true;
        }

        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            setFilters(toState);
        });

        // Record Type selections
        $scope.$on('driver.state.recordstate:options', function(event, options) {
            ctl.recordTypeResults = options;
        });
        $scope.$on('driver.state.recordstate:selected', function(event, selected) {
            ctl.recordTypeSelected = selected;
            updateState();
        });

        // Boundary selections
        $scope.$on('driver.state.boundarystate:options', function(event, options) {
            ctl.boundaryResults = options;
        });
        $scope.$on('driver.state.boundarystate:selected', function(event, selected) {
            ctl.boundarySelected = selected;
            updateState();
        });

        // Geography selections
        $scope.$on('driver.state.geographystate:options', function(event, options) {
            ctl.geographyResults = options;
        });
        $scope.$on('driver.state.geographystate:selected', function(event, selected) {
            ctl.geographySelected = selected;

            // Need to get the new list of boundaries for the selected geography.
            // Only do this after initializing: otherwise an unneeded request is sent.
            if (initialized) {
                BoundaryState.updateOptions({boundary: selected.uuid}).then(function() {
                    updateState();
                });
            }
        });

        // A function to set properties related to whether or not the filterbar should be instantiated for a given page
        function setFilters(state) {
            var filterPages = ['Map', 'Record List'];
            var isFilterPage = _.contains(filterPages, state.label);
            ctl.isFilterPage = isFilterPage;
        }

        // Sets states that can be navigated to (exclude current state, since we're already there)
        function setStates() {
            ctl.stateSelected = $state.current;
            ctl.availableStates = _.chain($state.get())
                .map(function(name) { return $state.get(name); })
                .filter(function(state) {
                    return state.showInNavbar && state.name !== $state.get().name;
                })
                .value();
        }

        // Updates the ui router state based on selected navigation parameters
        function updateState() {
            if (ctl.stateSelected && ctl.geographySelected && ctl.boundarySelected) {
                $state.go(ctl.stateSelected.name, {
                    rtuuid: ctl.recordTypeSelected.uuid,
                    geouuid: ctl.geographySelected.uuid,
                    polyuuid: ctl.boundarySelected.id
                });
            }
        }

        // Handler for when a geography is selected from the dropdown
        function onGeographySelected(geography) {
            GeographyState.setSelected(geography);
        }

        // Handler for when a boundary is selected from the dropdown
        function onBoundarySelected(boundary) {
            BoundaryState.setSelected(boundary);
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

        // Returns the label for a boundary, based on the currently selected geography
        // TODO: this should eventually be moved to an angular filter if needed elsewhere
        function getBoundaryLabel(boundary) {
            if (!boundary || !boundary.data || !ctl.geographySelected) {
                return '';
            }
            /* jshint camelcase: false */
            return boundary.data[ctl.geographySelected.display_field];
            /* jshint camelcase: true */
        }
    }

    angular.module('driver.navbar')
    .controller('NavbarController', NavbarController);

})();

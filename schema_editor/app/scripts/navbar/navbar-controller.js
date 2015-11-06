(function () {
    'use strict';

    /* ngInject */
    function ASENavbarController($rootScope, $scope, $state, AuthService) {
        var ctl = this;

        ctl.onLogoutButtonClicked = AuthService.logout; // TODO: add logout button
        ctl.authenticated = AuthService.isAuthenticated();
        ctl.onStateSelected = onStateSelected;
        ctl.navigateToStateName = navigateToStateName;
        $rootScope.$on('$stateChangeSuccess', function(event, toState) {
            ctl.authenticated = AuthService.isAuthenticated();
        });

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
            if (ctl.stateSelected) {
                $state.go(ctl.stateSelected.name);
            }
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
    }

    angular.module('ase.navbar')
    .controller('ASENavbarController', ASENavbarController);

})();

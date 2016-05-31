(function () {
    'use strict';

    /* ngInject */
    function SettingsList() {
        var module = {
            restrict: 'E',
            templateUrl: 'scripts/views/settings/list-partial.html',
            controller: 'SettingsListController',
            controllerAs: 'SettingsList',
            bindToController: true
        };
        return module;
    }

    angular.module('ase.views.settings')
    .directive('aseSettingsList', SettingsList);

})();

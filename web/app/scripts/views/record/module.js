(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('record', {
            abstract: true,
            url: '',
            template: '<ui-view></ui-view>'
        });
        $stateProvider.state('record.add', {
            url: '/add',
            template: '<driver-record-add-edit></driver-record-add-edit>',
            label: 'NAV.ADD_A_RECORD',
            showInNavbar: false
        });
        $stateProvider.state('record.addSecondary', {
            url: '/addsecondary',
            template: '<driver-record-add-edit></driver-record-add-edit>',
            label: 'NAV.ADD_A_RECORD',
            showInNavbar: false,
            secondary: true
        });
        $stateProvider.state('record.list', {
            url: '/list',
            template: '<driver-record-list></driver-record-list>',
            label: 'NAV.RECORD_LIST',
            showInNavbar: true
        });
        $stateProvider.state('record.edit', {
            url: '/record/:recorduuid/edit',
            template: '<driver-record-add-edit></driver-record-add-edit>',
            label: 'NAV.EDIT_A_RECORD',
            showInNavbar: false
        });
        $stateProvider.state('record.details', {
            url: '/record/:recorduuid/details',
            template: '<driver-record-details></driver-record-details>',
            label: 'NAV.RECORD_DETAILS',
            showInNavbar: false
        });
    }

    angular.module('driver.views.record', [
        'ngSanitize',
        'ase.auth',
        'ase.notifications',
        'ase.resources',
        'ase.schemas',
        'datetimepicker',
        'driver.config',
        'driver.localization',
        'driver.map-layers',
        'driver.details',
        'Leaflet',
        'driver.resources',
        'driver.state',
        'driver.nominatim',
        'driver.weather',
        'json-editor',
        'ui.bootstrap',
        'ui.router',
        'uuid'
    ]).config(StateConfig);

})();

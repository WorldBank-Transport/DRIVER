(function () {
    'use strict';

    /* ngInject */
    function StateConfig($stateProvider) {
        $stateProvider.state('record', {
            abstract: true,
            url: '/rt/:rtuuid',
            template: '<ui-view></ui-view>'
        });
        $stateProvider.state('record.add', {
            url: '/add',
            template: '<driver-record-add-edit></driver-record-add-edit>',
            label: 'Add a Record',
            // TODO: set this to false once there is an alternate way
            // within the ui to navigate to this view.
            showInNavbar: true
        });
        $stateProvider.state('record.list', {
            url: '/list',
            template: '<driver-record-list></driver-record-list>',
            label: 'Record List',
            showInNavbar: true
        });
        $stateProvider.state('record.edit', {
            url: '/record/:recorduuid/edit',
            template: '<driver-record-add-edit></driver-record-add-edit>',
            label: 'Edit a Record',
            showInNavbar: false
        });
    }

    angular.module('driver.views.record', [
        'ase.notifications',
        'ase.resources',
        'ase.schemas',
        'driver.config',
        'driver.resources',
        'json-editor',
        'ui.bootstrap',
        'ui.router',
        'uuid'
    ]).config(StateConfig);

})();

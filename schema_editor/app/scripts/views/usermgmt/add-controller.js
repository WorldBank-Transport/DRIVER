(function () {
    'use strict';

    /* ngInject */
    function UserAddController($log, $state, ASEConfig, AuthService, UserService, Notifications) {
        var ctl = this;
        ctl.user = {};
        ctl.userGroup = '';
        ctl.groups = ASEConfig.api.groups;

        ctl.submitForm = function() {

            ctl.user.groups = [ctl.userGroup];

            UserService.User.create(ctl.user, function(response) {
                Notifications.show({text: 'User ' + ctl.user.username + ' created successfully',
                                    displayClass: 'alert-info',
                                    timeout: 3000});
                $state.go('usermgmt.list');
            }, function(error) {
                Notifications.show({text: 'Failed to create user',
                                    displayClass: 'alert-danger'});
                $log.error('error creating user:');
                $log.error(error);
            });
        };
    }

    angular.module('ase.views.usermgmt')
    .controller('UserAddController', UserAddController);
})();

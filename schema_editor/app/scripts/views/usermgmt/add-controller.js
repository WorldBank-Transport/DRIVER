(function () {
    'use strict';

    /* ngInject */
    function UserAddController($log, $state, ASEConfig, AuthService, UserService, Notifications, Utils) {
        var ctl = this;
        ctl.user = {};
        ctl.userGroup = '';
        ctl.groups = ASEConfig.api.groups;

        ctl.submitForm = function() {

            ctl.user.groups = [ctl.userGroup];

            UserService.User.create(ctl.user, function() {
                Notifications.show({text: 'User ' + ctl.user.username + ' created successfully',
                                    displayClass: 'alert-success',
                                    timeout: 3000});
                $state.go('usermgmt.list');
            }, function(error) {
                $log.error('error creating user:');
                $log.error(error);

                var errorHtml = '<h4>Failed to create user</h4>';
                errorHtml += Utils.buildErrorHtml(error);

                Notifications.show({html: errorHtml, displayClass: 'alert-danger'});
            });
        };
    }

    angular.module('ase.views.usermgmt')
    .controller('UserAddController', UserAddController);
})();

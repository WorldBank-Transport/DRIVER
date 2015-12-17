(function () {
    'use strict';

    /* ngInject */
    function UserEditController($log, $state, $stateParams, ASEConfig, AuthService, UserService,
                                Notifications, Utils) {
        var ctl = this;
        ctl.user = {};
        ctl.userGroup = '';
        ctl.groups = ASEConfig.api.groups;
        initialize();

        function initialize() {
            getUserInfo();
        }

        // Helper for loading the user info
        function getUserInfo() {
            UserService.getUser($stateParams.userid).then(function(userInfo) {
                ctl.user = userInfo;
                ctl.user.token = AuthService.getToken();
                ctl.userGroup = getUserGroup();
            });
        }

        // Helper to pull out the highest access level DRIVER group to which the user belongs
        // (User can belong to multiple groups, but pretend like they are exclusive for the form.)
        function getUserGroup() {
            var groupList = ctl.user.groups; // an array of groups to which the user belongs

            if (groupList.indexOf(ASEConfig.api.groups.admin) > -1) {
                // admin
                return ASEConfig.api.groups.admin;
            } else if (groupList.indexOf(ASEConfig.api.groups.readWrite) > -1) {
                // analyst
                return ASEConfig.api.groups.readWrite;
            }

            // default to public
            return ASEConfig.api.groups.readOnly;
        }

        ctl.submitForm = function() {
            // submit just the data that may have changed
            var patchUser = {
                username: ctl.user.username,
                email: ctl.user.email,
                groups: [ctl.userGroup]
            };

            UserService.User.update({id: ctl.user.id}, patchUser, function() {
                getUserInfo();
                Notifications.show({text: 'Successfully updated user ' + ctl.user.email,
                                   displayClass: 'alert-success',
                                   timeout: 3000});
                $state.go('usermgmt.list');
            }, function(error) {
                $log.error('error updating user:');
                $log.error(error);

                var errorHtml = '<h4>Failed to modify user</h4>';
                errorHtml += Utils.buildErrorHtml(error);

                Notifications.show({html: errorHtml, displayClass: 'alert-danger'});
            });
        };
    }

    angular.module('ase.views.usermgmt')
    .controller('UserEditController', UserEditController);
})();

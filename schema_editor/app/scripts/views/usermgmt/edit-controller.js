(function () {
    'use strict';

    /* ngInject */
    function UserEditController($log, $stateParams, ASEConfig, AuthService, UserService) {
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

                $log.debug('got user:');
                $log.debug(ctl.user);

                $log.debug('in group:');
                $log.debug(ctl.userGroup);
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
            $log.debug("submitted user info:");
            $log.debug(ctl.user);
            $log.debug("and group info:");
            $log.debug(ctl.userGroup);

            var patchUser = {
                username: ctl.user.username,
                email: ctl.user.email,
                groups: 'SOMEJUNK'
                //groups: [ctl.userGroup]
            };

            var response = UserService.User.update({id: ctl.user.id}, patchUser);

            $log.debug('TODO: look at $promise on this response and check for error');
            // also reload user info on success
            $log.debug(response);
        };
    }

    angular.module('ase.views.usermgmt')
    .controller('UserEditController', UserEditController);
})();

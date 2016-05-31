(function() {
    'use strict';

    /**
     * @ngInject
     */
    function UserListController ($log, $scope, Notifications, UserService, ASEConfig) {

        var ctl = this;
        initialize();

        function initialize() {
            ctl.users = {};
            ctl.groups = _.values(ASEConfig.api.groups).sort();
            ctl.groupFilter = null;

            ctl.deleteUser = deleteUser;
            ctl.onGroupSelected = onGroupSelected;

            refreshUserList();
        }

        function deleteUser(user) {
            UserService.User.delete({id: user.id}, function () {
                refreshUserList();

                Notifications.show({text: 'Deleted user ' + user.username + ' successfully.',
                                    displayClass: 'alert-success',
                                    timeout: 3000});
            }, function(error) {
                $log.error(error);

                Notifications.show({text: 'Error deleting user ' + user.email,
                                   displayClass: 'alert-danger'});
            });
        }

        function filterUserList() {
            ctl.users = _.filter(ctl.allUsers, function (user) {
                return !ctl.groupFilter || _.contains(user.groups, ctl.groupFilter);
            });
        }

        function refreshUserList() {
            UserService.User.query().$promise.then(function (results) {
                ctl.allUsers = results;
                filterUserList();
            });
        }

        function onGroupSelected(group) {
            ctl.groupFilter = group;
            filterUserList();
        }
    }

    angular.module('ase.views.usermgmt').controller('UserListController', UserListController);

})();

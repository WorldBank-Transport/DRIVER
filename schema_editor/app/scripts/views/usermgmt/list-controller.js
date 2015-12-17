(function() {
    'use strict';

    /**
     * @ngInject
     */
    function UserListController ($log, $scope, Notifications, UserService) {

        var ctl = this;
        initialize();

        function initialize() {

            ctl.users = {};

            ctl.deleteUser = deleteUser;

            refreshUserList();
        }

        function deleteUser(user) {
            UserService.User.delete({id: user.id}, function () {
                refreshUserList();

                Notifications.show({text: 'Deleted user ' + user.username + ' successfully.',
                                    displayClass: 'alert-info',
                                    timeout: 3000});
            }, function(error) {
                $log.error(error);

                Notifications.show({text: 'Error deleting user ' + user.email,
                                   displayClass: 'alert-danger'});
            });
        }

        function refreshUserList() {
            ctl.users = UserService.User.query();
        }
    }

    angular.module('ase.views.usermgmt').controller('UserListController', UserListController);

})();

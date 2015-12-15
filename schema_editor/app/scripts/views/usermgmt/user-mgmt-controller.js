(function() {
    'use strict';

    /**
     * @ngInject
     */
    function UserMgmtController ($log, $scope, Notifications, UserService) {

        var ctl = this;
        initialize();

        function initialize() {

            ctl.users = {};

            ctl.deleteUser = deleteUser;

            refreshUserList();
        }

        function deleteUser(user) {
            UserService.User.delete({id: user.id}, function (data) {
                refreshUserList();
            }, function(error) {
                $log.error(error);

                // TODO: find out why notifications do not display on list view page
                Notifications.show({text: 'Error deleting user ' + user.email,
                                   displayClass: 'alert-danger'});
            });
        }

        function refreshUserList() {
            ctl.users = UserService.User.query();
        }
    }

    angular.module('ase.views.usermgmt').controller('UserMgmtController', UserMgmtController);

})();

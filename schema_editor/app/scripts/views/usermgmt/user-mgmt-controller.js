(function() {
    'use strict';

    /**
     * @ngInject
     */
    function UserMgmtController ($log, $scope, UserService, ASEConfig) {

        var ctl = this;
        initialize();

        function initialize() {

            ctl.alerts = [];
            ctl.status = {};
            ctl.users = {};

            ctl.addUser = addUser;
            ctl.changeUserGroup = changeUserGroup;
            ctl.deleteUser = deleteUser;

            refreshUserList();
            $scope.$on('ase.usermgmt.changed', refreshUserList);
        }

        /*
         * Queries for an updated set of active record types
         */
        function refreshUserList() {
            $log.debug('going to fetch user list');
            ctl.users = UserService.User.query().results;
            UserService.User.query(function(users) {
                $log.debug('got users:');
                $log.debug(users);
                ctl.users = users.results;
            }, function(error) {
                $log.error('error fetching user list:');
                $log.error(error);
            });
        }

        function addAlert(alertObject) {
            ctl.alerts.push(alertObject);
        }

        function closeAlert(index) {
            ctl.alerts.splice(index, 1);
        }

        function changeUserGroup(userId, groupId) {
            // return success?
        }

        function addUser(username) {
            // return new user with password auth
        }

        function deleteUser(user) {
            // return success?
            $log.debug('going to delete user:');
            $log.debug(user);
            UserService.User.delete({id: user.id}, function (data) {
                refreshUserList();
            }, function(error) {
                // TODO: UI error display
                $log.error(error);
                handleError(error);
            });
        }

        // TODO: access to cycle tokens?

        function handleError(result) {
            ctl.status.failure = true;
            var msg = result.error || (result.status + ': Unknown Error.');
            addAlert({
                type: 'danger',
                msg: msg
            });
        }
    }

    angular.module('ase.views.usermgmt').controller('UserMgmtController', UserMgmtController);

})();

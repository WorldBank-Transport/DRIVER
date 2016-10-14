(function() {
    'use strict';

    /**
     * @ngInject
     */
    function UserService ($log, $resource, $q, ASEConfig) {

        var tmpToken = '';

        var User = $resource(ASEConfig.api.hostname + '/api/users/:id/', {id: '@id', limit: 'all'}, {
            'create': {
                method: 'POST',
                url: ASEConfig.api.hostname + '/api/users/'
            },
            'delete': {
                method: 'DELETE',
                url: ASEConfig.api.hostname + '/api/users/:id/'
            },
            'update': {
                method: 'PATCH',
                url: ASEConfig.api.hostname + '/api/users/:id/'
            },
            'changePassword' : {
                method: 'POST',
                url: ASEConfig.api.hostname + '/api/users/:id/change_password/'
            },
            'resetPassword' : {
                method: 'POST',
                url: ASEConfig.api.hostname + '/api/users/:id/reset_password/'
            },
            'query': {
                method: 'GET',
                transformResponse: function(data) { return angular.fromJson(data).results; },
                isArray: true
            },
            'queryWithTmpHeader': {
                method: 'GET',
                headers: {
                    'Authorization': function() {
                        // use a temporarily set token
                        return 'Token ' + tmpToken;
                    }
                }
            }
        }, {
            cache: true,
            stripTrailingSlashes: false
        });

        var module = {
            User: User,
            canWriteRecords: canWriteRecords,
            getUser: getUser,
            isAdmin: isAdmin
        };
        return module;

        function getUser(userId) {
            var dfd = $q.defer();
            module.User.get({id: userId}, function (user) {
                // append attribute to response to indicate if user is an admin or not
                user.isAdmin = userBelongsToAdmin(user);
                dfd.resolve(user);
            });
            return dfd.promise;
        }

        // Check whether user has write access
        function canWriteRecords(userId, token) {
            tmpToken = token;
            var dfd = $q.defer();
            module.User.queryWithTmpHeader({id: userId}, function (user) {
                if (user && user.groups) {
                    // admin or analyst can write records
                    if (userBelongsToAdmin(user) ||
                        user.groups.indexOf(ASEConfig.api.groups.readWrite) > -1) {

                        dfd.resolve(true);
                    } else {
                        dfd.resolve(false);
                    }
                } else {
                    dfd.resolve(false);
                }
                tmpToken = '';
            });

            return dfd.promise;
        }

        // Check whether user is an admin or not before logging them in (for the editor)
        function isAdmin(userId, token) {
            tmpToken = token;
            var dfd = $q.defer();
            module.User.queryWithTmpHeader({id: userId}, function (user) {
                $log.debug('user service got user to test:');
                $log.debug(user);
                $log.debug('with groups:');
                $log.debug(user.groups);
                if (userBelongsToAdmin(user)) {
                    $log.debug('have admin in user service');
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
                tmpToken = '';
            });

            return dfd.promise;
        }

        // hepler to check for admin group membership
        function userBelongsToAdmin(user) {
            if (user && user.groups && user.groups.indexOf(ASEConfig.api.groups.admin) > -1) {
                return true;
            } else {
                return false;
            }
        }
    }

    angular.module('ase.userdata').factory('UserService', UserService);

})();


(function() {
    'use strict';

    /**
     * @ngInject
     */
    function UserService ($resource, $q, ASEConfig) {

        var tmpToken = '';

        var User = $resource(ASEConfig.api.hostname + '/api/users/:id/', {id: '@id'}, {
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
                headers: {
                    'Authorization': function() {
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
            getUser: getUser,
            isAdmin: isAdmin
        };
        return module;

        function getUser(userId) {
            var dfd = $q.defer();
            var result = module.User.get({id: userId}, function () {
                dfd.resolve(result);
            });
            return dfd.promise;
        }

        // check whether user has write access, post login
        function canWriteRecords(userId) {
            var dfd = $q.defer();
            module.User.query({id: userId}, function (user) {
                if (user && user.groups) {

                    // admin or analyst can write records
                    if (user.groups.indexOf(ASEConfig.api.groups.admin) > -1 ||
                        user.groups.indexOf(ASEConfig.api.groups.readWrite) > -1) {

                        dfd.resolve(true);
                    } else {
                        dfd.resolve(false);
                    }
                } else {
                    dfd.resolve(false);
                }
            });

            return dfd.promise;
        }

        /*
         * Check whether user is an admin or not before logging them in (for the editor).
         * Takes the user ID and token obtained by authentication but not yet set in cookies,
         * temporarily sets the Authorization header in order to query for the user information,
         * then un-sets the temporary header when done.
         */
        function isAdmin(userId, token) {
            tmpToken = token;
            var dfd = $q.defer();
            module.User.query({id: userId}, function (user) {
                if (user && user.groups && user.groups.indexOf(ASEConfig.api.groups.admin) > -1) {
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
                tmpToken = '';
            });

            return dfd.promise;
        }
    }

    angular.module('ase.userdata').factory('UserService', UserService);

})();


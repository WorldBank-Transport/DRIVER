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
                    'Authorization': function(config) {
                        return 'Token ' + tmpToken;
                    }
                }
            }
        }, {
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

        function isAdmin(userId, token) {
            tmpToken = token;
            var dfd = $q.defer();
            module.User.query({id: userId}, function (user) {
                /* jshint camelcase: false */
                if (user && user.is_staff) {
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
                /* jshint camelcase: true */
                tmpToken = '';
            });

            // config.headers.Authorization = 'Token ' + $cookies.getObject('AuthService.token');
            return dfd.promise;
        }
    }

    angular.module('ase.userdata').factory('UserService', UserService);

})();


(function() {
    'use strict';

    /**
     * @ngInject
     */
    function UserService ($resource, $q, ASEConfig) {

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
                method: 'GET'
            }
        }, {
            stripTrailingSlashes: false
        });

        // TODO: Load from API
        var groups = [
            {
                id: 1,
                name: 'Administrator'
            },
            {
                id: 2,
                name: 'User'
            }
        ];

        var module = {
            User: User,
            getUser: getUser,
            isSuperUser: isSuperUser,
            groups: groups
        };
        return module;

        function getUser(userId) {
            var dfd = $q.defer();
            var result = module.User.get({id: userId}, function () {
                dfd.resolve(result);
            });
            return dfd.promise;
        }

        function isSuperUser(user) {
            return user.groups[0] === groups[0].id;
        }
    }

    angular.module('ase.userdata').factory('UserService', UserService);

})();


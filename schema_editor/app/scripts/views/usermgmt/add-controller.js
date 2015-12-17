(function () {
    'use strict';

    /* ngInject */
    function UserAddController($log, $state, ASEConfig, AuthService, UserService, Notifications) {
        var ctl = this;
        ctl.user = {};
        ctl.userGroup = '';
        ctl.groups = ASEConfig.api.groups;

        ctl.submitForm = function() {

            ctl.user.groups = [ctl.userGroup];

            UserService.User.create(ctl.user, function(response) {
                Notifications.show({text: 'User ' + ctl.user.username + ' created successfully',
                                    displayClass: 'alert-info',
                                    timeout: 3000});
                $state.go('usermgmt.list');
            }, function(error) {
                $log.error('error creating user:');
                $log.error(error);

                var errorHtml = '<h4>Failed to create user</h4>';

                // get back dict of {fieldName: [Array of errors]}
                if (error.data) {
                    errorHtml += '<ul>';
                    angular.forEach(error.data, function(fieldErrors, fieldName) {
                        // list point for each field
                        errorHtml += '<li>' + fieldName + ':';
                        if (fieldErrors.length) {
                            errorHtml += '<ul>';
                            // sub-list with points for each field error
                            fieldErrors.forEach(function(err) {
                                errorHtml += '<li>' + err + '</li>';
                            });
                            errorHtml += '</ul>';
                        }
                        errorHtml += '</ul>';
                    });
                }

                $log.debug(errorHtml);

                Notifications.show({html: errorHtml, displayClass: 'alert-danger'});
            });
        };
    }

    angular.module('ase.views.usermgmt')
    .controller('UserAddController', UserAddController);
})();

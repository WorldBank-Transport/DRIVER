(function () {
    'use strict';

    /* ngInject */
    function SocialCosts() {
        var module = {
            restrict: 'EA',
            templateUrl: 'scripts/social-costs/social-costs.html',
            scope: {
                costData: '='
            }
        };
        return module;
    }

    angular.module('driver.socialCosts')
    .directive('driverSocialCosts', SocialCosts);

})();

(function () {
    'use strict';

    /* ngInject */
    function SocialCosts() {
        var module = {
            restrict: 'EA',
            templateUrl: function(elem, attrs) {
                // Note that use of templateUrls is discouraged in most cases
                // as per
                // https://github.com/angular/angular.js/issues/2895
                // The preferred solution is to use ng-switch, but that turned
                // out to be intensely awkward in this case due to the
                // differences in display logic between the two versions of the
                // directive and some of the assumptions in the CSS about
                // element nesting. This case is a good fit for use of a
                // templateUrl function, i.e. it is "basically static, but you
                // don't necessarily know ahead of time". However, in order to
                // discourage the use of templateUrl functions, they provide
                // uncompiled attributes which is why the attribute access here
                // is a less straightforward than a simple boolean check.
                if (attrs.asTool && attrs.asTool === 'true') {
                    return 'scripts/social-costs/social-costs-tool.html';
                } else {
                    return 'scripts/social-costs/social-costs.html';
                }
            },
            controller: 'SocialCostsController',
            controllerAs: 'ctl',
            bindToController: true,
            scope: {
                costData: '<',
                asTool: '@'
            }
        };

        return module;
    }

    angular.module('driver.socialCosts')
    .directive('driverSocialCosts', SocialCosts);

})();

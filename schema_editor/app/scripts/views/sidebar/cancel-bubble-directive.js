/**
 * Attribute directive which cancels upward propagation of click events on that element
 */
(function () {
    'use strict';

    /* ngInject */
    function CancelBubble($log) {
        var module = {
            restrict: 'A',
            link: link
        };
        return module;

        function link(scope, element) {

            element.click(function (event) {
                // All the cool kids
                if (event.stopPropagation) {
                    event.stopPropagation();
                // IE8 & below
                } else {
                    $log.debug('Used cancelBubble in cancel-bubble directive');
                    event.cancelBubble = true;
                }
            });
        }
    }

    angular.module('ase.views.sidebar')
    .directive('cancelBubble', CancelBubble);

})();

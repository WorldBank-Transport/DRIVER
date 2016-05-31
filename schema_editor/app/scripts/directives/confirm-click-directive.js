/**
 * Attribute directive which displays a confirmation dialog when an element is clicked.
 * Usage:
 *   <a ase-confirm-click="functionToRun()"></a>
 */
(function () {
    'use strict';

    /* ngInject */
    function ConfirmClick($window) {

        var module = {
            restrict: 'A',
            link: link
        };
        return module;

        function link(scope, element, attr) {
            element.bind('click', function() {
                if ($window.confirm('Are you sure?')) {
                    scope.$eval(attr.aseConfirmClick);
                }
            });
        }
    }

    angular.module('ase.directives')
    .directive('aseConfirmClick', ConfirmClick);
})();

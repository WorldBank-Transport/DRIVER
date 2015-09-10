(function () {
    'use strict';

    /* ngInject */
    function LabelFormatter() {
        /* Return control label for presentation.
         *
         * @param {String} Nampespaced label description in the form `parent#child`
         * @return {String} Label prettified to `parent: child`
         */
        return function(label) {
            if (!label) {
                return '';
            }

            return label.replace(/#/, ': ');
        };
    }

    angular.module('driver.filterbar')
    .filter('labelFormatter', LabelFormatter);
})();

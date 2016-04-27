(function () {
    'use strict';

    /* ngInject */
    function DateRangeController() {
        var ctl = this;
        // TODO: date format needs localization
        ctl.dateTimeFormat = 'YYYY-MM-DDThh:mm:ss';
        ctl.error = {};

        /**
         * Determine validity of a min-max pairing
         */
        ctl.isMinMaxValid = function(minMax) {
            var min, max;
            if (minMax.min) { min = minMax.min; }
            if (minMax.max) { max = minMax.max; }

            if (max && min) {
                return new Date(max) >= new Date(min);
            }

            if (max || min) {
                return true;
            }
            return false;
        };

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('dateRangeController', DateRangeController);

})();

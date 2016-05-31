(function () {
    'use strict';

    /* ngInject */
    function NumericRangeController() {
        var ctl = this;
        ctl.error = {};

        /**
         * Determine validity of a min-max pairing and set some classes on this object
         */
        ctl.isMinMaxValid = function(min, max) {
            if (typeof min === 'number' && typeof max === 'number') {
                var minMaxValid = min <= max;
                if (!minMaxValid) {
                    ctl.error.classes = 'alert-danger';
                    ctl.error.btnClasses = '';
                } else {
                    ctl.error.classes = '';
                    ctl.error.btnClasses = '';
                }
                return minMaxValid;
            }
            ctl.error.classes = '';
            ctl.error.btnClasses = '';
            return true;
        };

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('numericRangeController', NumericRangeController);

})();

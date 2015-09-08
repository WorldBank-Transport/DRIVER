(function () {
    'use strict';

    /* ngInject */
    function OptionsController() {
        var ctl = this;
        ctl.currentSelection = null;

        /**
         * Determine if current selection differs from last.
         */
        ctl.selectionChanged = function(newSelection) {
            if (ctl.currentSelection && ctl.currentSelection === newSelection) {
                return true;
            } else {
                ctl.currentSelection = newSelection;
                return false;
            }
        };

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('optionsController', OptionsController);

})();

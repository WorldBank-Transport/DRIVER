(function () {
    'use strict';

    /* ngInject */
    function OptionsController() {
        var ctl = this;

        ctl.currentSelection = null;

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('optionsController', OptionsController);

})();

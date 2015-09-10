(function () {
    'use strict';

    /* ngInject */
    function OptionsController() {
        var ctl = this;

        ctl.selection = null;

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('optionsController', OptionsController);

})();

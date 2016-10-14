(function () {
    'use strict';

    /* ngInject */
    function OptionsController() {
        var ctl = this;

        return ctl;
    }

    angular.module('driver.filterbar')
    .controller('optionsController', OptionsController);

})();

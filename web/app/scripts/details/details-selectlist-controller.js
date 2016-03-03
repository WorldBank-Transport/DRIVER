(function () {
    'use strict';

    /* ngInject */
    function DetailsSelectlistController() {
        var ctl = this;
        init();

        function init() {
            if (Array.isArray(ctl.data)) {
                ctl.data = ctl.data.join('; ');
            }
        }
    }

    angular.module('driver.details')
    .controller('DetailsSelectlistController', DetailsSelectlistController);

})();

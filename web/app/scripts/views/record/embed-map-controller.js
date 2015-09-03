(function () {
    'use strict';

    /* ngInject */
    function EmbedMapController() {
        var ctl = this;
        //ctl.error = {};

        /**
         * TODO: stuff
         */
        ctl.here = function() {
            console.log('howdy!');
        };

        return ctl;
    }

    angular.module('driver.views.record')
    .controller('embedMapController', EmbedMapController);

})();

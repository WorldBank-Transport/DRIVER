
(function () {
    'use strict';

    /* ngInject */
    function Utils () {
        var module = {
            makeID: makeID
        };
        return module;

        function makeID(idLength) {
            idLength = isNaN(idLength) ? 8 : parseInt(idLength, 10);
            var text = '';
            var possible = 'ABCDEFGHIkLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 0; i < idLength; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        }
    }

    angular.module('ase.utils')
    .factory('Utils', Utils);

})();

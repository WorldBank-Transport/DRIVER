
(function () {
    'use strict';

    /* ngInject */
    function Utils () {
        var module = {
            buildErrorHtml: buildErrorHtml,
            makeID: makeID
        };
        return module;

        /**
         * Build descriptive list of fields with sub-lists of field errors.
         *
         * @param error Object DRF error response
         * @return String HTML to display in notification
         */
        function buildErrorHtml(error) {
            var errorHtml = '';
            // get back dict of {fieldName: [Array of errors]} from DRF CRUD endpoints
            if (error.data) {
                errorHtml += '<ul>';
                angular.forEach(error.data, function(fieldErrors, fieldName) {
                    // list point for each field
                    errorHtml += '<li>' + fieldName + ':';
                    if (fieldErrors.length) {
                        errorHtml += '<ul>';
                        // sub-list with points for each field error
                        fieldErrors.forEach(function(err) {
                            errorHtml += '<li>' + err + '</li>';
                        });
                        errorHtml += '</ul>';
                    }
                    errorHtml += '</ul>';
                });
            }
            return errorHtml;
        }

        // TODO: This function appears to be unused. Why is it here?
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

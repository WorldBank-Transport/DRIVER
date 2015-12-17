
(function () {
    'use strict';

    /* ngInject */
    function Utils () {
        var module = {
            buildErrorHtml: buildErrorHtml
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
    }

    angular.module('ase.utils')
    .factory('Utils', Utils);

})();

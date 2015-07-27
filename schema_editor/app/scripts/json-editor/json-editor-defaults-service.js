(function () {
    'use strict';

    /* ngInject */
    function JsonEditorDefaults() {
        var module = {
            customValidators: {
                push: pushCustomValidator,
                pop: popCustomValidator,
                clear: clearCustomValidators
            }
        };

        /* jshint camelcase: false */
        function pushCustomValidator(validator) {
            return JSONEditor.defaults.custom_validators.push(validator);
        }

        function popCustomValidator() {
            return JSONEditor.defaults.custom_validators.pop();
        }

        function clearCustomValidators() {
            JSONEditor.defaults.custom_validators = [];
        }
        /* jshint camelcase: true */

        return module;
    }

    angular.module('json-editor')
    .service('JsonEditorDefaults', JsonEditorDefaults);
})();

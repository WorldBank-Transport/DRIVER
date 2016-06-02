(function () {
    'use strict';

    /* ngInject */
    function JsonEditorDefaults() {
        var module = {
            customValidators: {
                push: pushCustomValidator,
                pop: popCustomValidator,
                clear: clearCustomValidators
            },
            addTranslation: addTranslation
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

        // Adds a translation mapping for the json-editor to use.
        // To see the available keys, see `src/defaults.json` in the json-editor repo.
        function addTranslation(key, val) {
            JSONEditor.defaults.languages.en[key] = val;
        }
        /* jshint camelcase: true */

        return module;
    }

    angular.module('json-editor')
    .service('JsonEditorDefaults', JsonEditorDefaults);
})();

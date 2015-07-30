/**
 * Directive wrapper for the JSONSchema js plugin:
 *     https://github.com/jdorn/json-editor
 *
 * @param {string} editorId A string identifier that can be used to retrieve the editor object
 *                          from the associated Editor service
 * @param {object} options A JSONEditor options object, passed directly to the constructor
 *                         default: {}
 * @param {function} onDataChange A function on the wrapper scope to be called when the editor
 *                                data changes, passes new editor data as first argument.
 *
 * Events:
 *      json-editor:ready
 *          @param {JSONEditor} editor The editor object that is now ready
 */
(function () {
    'use strict';

    var defaults = {};

    /* ngInject */
    function JsonEditor(JsonEditorDefaults) {

        var module = {
            restrict: 'E',
            scope: {
                editorId: '@',
                options: '=',
                onDataChange: '&'
            },
            link: link
        };
        return module;

        function link(scope, element) {
            var editor = null;
            var htmlElement = element[0];
            var changeRef = null;

            // Every time the editor options change, we need to destroy and recreate
            // the form, preserving the user-entered data in the form
            //
            // Note: since the switch to using arrays as the form builder root, the options
            // are never updated, and this destroy/recreate logic isn't run. Keeping the logic
            // in here for the time being as it doesn't hurt anything and may be useful to
            // someone if this is released as a standalone directive.
            scope.$watch('options', function (newValue) {
                if (!(newValue && newValue.schema)) {
                    return;
                }
                var options = angular.extend({}, defaults, scope.options);

                var oldData = null;
                // Delete old editor
                if (editor) {
                    oldData = editor.getValue();
                    editor.off('change', changeRef);
                    editor.destroy();
                    editor = null;
                }

                // Recreate with new options
                editor = new JSONEditor(htmlElement, options);
                if (oldData !== null) {
                    // Extend new with old
                    var newData = editor.getValue();
                    angular.extend(newData, options.startval, oldData);
                    editor.setValue(newData);
                }
                changeRef = editor.on('change', function () {
                    var editorData = editor.getValue();
                    var errors = editor.validate();
                    // Bring data changes into the angular digest lifecycle
                    scope.$apply(function() { scope.onDataChange()(editorData, errors, editor); });
                });
            });

            // TODO: This is hideous, but it's necessary because all custom validators in
            // JSON-Editor must be placed on the root JSONEditor object, which is a limitation of
            // the library. In order to prevent custom validators from sticking around, we need to
            // ensure that this gets cleaned up whenever a json-editor element is destroyed.  Note
            // that this means that it is not possible to have two JsonEditor directives using
            // different custom validators on the same page.  However, it ensures that directives in
            // different pages don't pollute the global JSONEditor object.
            element.on('$destroy', function() {
                JsonEditorDefaults.customValidators.clear();
            });
        }
    }

    angular.module('json-editor')
    .directive('jsonEditor', JsonEditor);

})();

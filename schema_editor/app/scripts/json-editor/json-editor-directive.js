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

    function JsonEditor() {

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
                    scope.onDataChange()(editorData, errors);
                });
            });
        }
    }

    angular.module('json-editor')
    .directive('jsonEditor', JsonEditor);

})();

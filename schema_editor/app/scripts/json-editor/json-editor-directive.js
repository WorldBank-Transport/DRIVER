/**
 * Directive wrapper for the JSONSchema js plugin:
 *     https://github.com/jdorn/json-editor
 *
 * @param {string} editorId A string identifier that can be used to retrieve the editor object
 *                          from the associated Editor service
 * @param {object} options A JSONEditor options object, passed directly to the constructor
 *                         default: {}
 *
 * Events:
 *      json-editor:ready
 *          @param {JSONEditor} editor The editor object that is now ready
 */
(function () {
    'use strict';

    var defaults = {};

    function JsonEditor() {

        var editor = null;

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
            var htmlElement = element[0];
            var changeRef = null;
            scope.$watch('options', function (newValue) {
                if (!(newValue && newValue.schema)) {
                    return;
                }
                var options = angular.extend({}, defaults, scope.options);
                delete options.startval;

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
                    angular.extend(newData, oldData);
                    editor.setValue(newData);
                }
                changeRef = editor.on('change', function () {
                    var editorData = editor.getValue();
                    scope.onDataChange()(editorData);
                });
            });
        }
    }

    angular.module('json-editor')
    .directive('jsonEditor', JsonEditor);

})();

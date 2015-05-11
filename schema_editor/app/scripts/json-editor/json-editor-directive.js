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

    function JsonEditor (Editor) {

        var editor = null;

        var module = {
            restrict: 'E',
            scope: {
                editorId: '@',
                options: '='
            },
            link: link
        };
        return module;

        function link(scope, element) {
            var htmlElement = element[0];
            var options = angular.extend({}, defaults, scope.options);
            editor = new JSONEditor(htmlElement, options);

            Editor.set(scope.editorId, editor);
            scope.$emit('json-editor:ready', editor);
        }
    }

    angular.module('json-editor')
    .directive('jsonEditor', JsonEditor);

})();

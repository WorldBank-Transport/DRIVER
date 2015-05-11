/**
 * Store and retrieve JSONEditor objects
 */
(function () {
    'use strict';

    function Editor() {

        var editors = {};

        var module = {
            set: set,
            remove: remove,
            get: get
        };
        return module;

        function set(editorId, editor) {
            var success = false;
            if (!editors[editorId]) {
                editors[editorId] = editor;
                success = true;
            }
            return success;
        }

        function remove(editorId) {
            delete editors[editorId];
        }

        function get(editorId) {
            return editors[editorId] || null;
        }
    }

    angular.module('json-editor')
    .service('Editor', Editor);

})();

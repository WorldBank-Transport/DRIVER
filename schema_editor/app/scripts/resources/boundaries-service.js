(function () {
    'use strict';

    /* ngInject */
    function Boundaries($resource, Upload, Config) {
        var urlString = Config.api.hostname + '/api/boundaries/';

        var res = $resource(urlString + ':uuid/ ', {uuid: '@uuid'}, {
            query: {
                method: 'GET',
                transformResponse: function(data) { return angular.fromJson(data).results; },
                isArray: true
            },
            update: {
                method: 'PATCH',
            }
        });

        /**
         * Custom extension of boundaries resource which uses ng-file-upload to send along the
         *  shapefile which will be used to generate a geometry
         *
         * @param {array} files A list of files (most likely grabbed from a form) from which the
         *                       head will be taken and sent across the wire
         *
         * @param {string} label The label which wil uniquely designate this geography
         *
         * @param {string} color The color for this geography
         *
         * @param {function} success A callback to be executed upon successful completion of this
         *                            upload
         *
         */
        res.create = function(files, label, color, success, error) {
            if (files && files.length) {
                var file = files[0];
                Upload.upload({
                    url: urlString,
                    method: 'POST',
                    fields: {'label': label,
                             'color': color},
                    file: file,
                    fileFormDataName: 'source_file'
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(success).error(error);
            }
        };

        return res;
    }

    angular.module('ase.resources')
      .factory('Boundaries', Boundaries);
})();

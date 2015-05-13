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

        res.create = function(files, label, color, success) {
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
                }).success(success);
            }
        };

        return res;
    }

    angular.module('ase.resources')
      .factory('Boundaries', Boundaries);
})();

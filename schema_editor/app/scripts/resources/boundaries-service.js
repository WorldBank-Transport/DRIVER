(function () {
    'use strict';

    /* ngInject */
    function Boundaries($resource, Config) {
      var urlString = Config.api.hostname + '/api/boundaries/:id';

      return $resource(urlString, {id: '@uuid'});
    }

    angular.module('ase.resources')
      .factory('Boundaries', Boundaries);
})();

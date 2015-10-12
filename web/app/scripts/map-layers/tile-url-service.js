(function () {
    'use strict';

    // TODO: Finish refactor by changing the views/map/layers-controller.js and the embed-map
    // controller to use this.
    function TileUrlService($q, WebConfig) {
        var allRecordsUrl = (WebConfig.windshaft.hostname +
            '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.png');
        var allRecordsUtfGridUrl = (WebConfig.windshaft.hostname +
            '/tiles/table/ashlar_record/id/ALL/{z}/{x}/{y}.grid.json');
        var positronUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

        var module = {
            recTilesUrl: recordsTilesUrlForType,
            allRecTilesUrl: recordsTilesUrlForAll,
            recUtfGridTilesUrl: recordsUtfGridTilesUrlForType,
            allRecUtfGridTilesUrl: recordsUtfGridTilesUrlForAll,
            positronUrl: getPositronUrl
        };
        return module;

        function recordsTilesUrlForAll() {
            return _makePromise(allRecordsUrl);

        }

        function recordsTilesUrlForType(typeUuid) {
            return _makePromise(allRecordsUrl.replace(/ALL/, typeUuid));
        }

        function recordsUtfGridTilesUrlForAll() {
            return _makePromise(allRecordsUtfGridUrl);
        }

        function recordsUtfGridTilesUrlForType(typeUuid) {
            return _makePromise((allRecordsUtfGridUrl.replace(/ALL/, typeUuid)));
        }

        function getPositronUrl() {
            return _makePromise(positronUrl);
        }

        function _makePromise(value) {
            var promise = $q.defer();
            promise.resolve(value);
            return promise.promise;
        }
    }

    angular.module('driver.map-layers')
    .factory('TileUrlService', TileUrlService);
})();

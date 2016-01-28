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
        var allBoundariesUrl = (WebConfig.windshaft.hostname +
            '/tiles/table/ashlar_boundary/id/ALL/{z}/{x}/{y}.png');
        var heatmapUrl = allRecordsUrl + '?heatmap=true';
        var blackspotsUrl = (WebConfig.windshaft.hostname +
                             '/tiles/table/black_spots_blackspot/id/ALL/{z}/{x}/{y}.png');
        var blackspotsUtfGridUrl = (WebConfig.windshaft.hostname +
                                    '/tiles/table/black_spots_blackspot/id/ALL/{z}/{x}/{y}.grid.json');

        var module = {
            recTilesUrl: recordsTilesUrlForType,
            recUtfGridTilesUrl: recordsUtfGridTilesUrlForType,
            recHeatmapUrl: recordsHeatmapTilesUrl,
            boundaryTilesUrl: boundaryTilesUrl,
            baseLayerUrl: getBaseLayerUrl,
            blackspotsUrl: blackspotTilesUrl,
            blackspotsUtfGridUrl: blackspotUtfGridTilesUrl
        };
        return module;

        function recordsTilesUrlForType(typeUuid) {
            return _insertIdAtALL(allRecordsUrl, typeUuid);
        }

        function recordsUtfGridTilesUrlForType(typeUuid) {
            return _insertIdAtALL(allRecordsUtfGridUrl, typeUuid);

        }

        function recordsHeatmapTilesUrl(typeUuid) {
            return _insertIdAtALL(heatmapUrl, typeUuid);
        }

        function boundaryTilesUrl(boundsUuid) {
            return _insertIdAtALL(allBoundariesUrl, boundsUuid);
        }

        function blackspotTilesUrl(blackspotSet) {
            return _insertIdAtALL(blackspotsUrl, blackspotSet);
        }

        function blackspotUtfGridTilesUrl(blackspotSet) {
            return _insertIdAtALL(blackspotsUtfGridUrl, blackspotSet);
        }

        function getBaseLayerUrl() {
            return _makePromise(positronUrl);
        }

        /* Inserts an ID into a URL at the first occurrence of ALL
         *
         * param {String} url The url in which to insert the id
         * param {String} id The id to be inserted
         * returns {String} The URL with id substituted for ALL, if id is truthy
         */
        function _insertIdAtALL(url, id) {
            if (id) {
                return _makePromise(url.replace(/ALL/, id));
            }
            return _makePromise(url);
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

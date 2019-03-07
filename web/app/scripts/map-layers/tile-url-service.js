(function () {
    'use strict';

    /* A service for generating URLS for tile layers, since they need to be customized by ID.
     */

    function TileUrlService(WebConfig) {
        var allRecordsUrl = (WebConfig.windshaft.hostname +
            '/tiles/table/grout_record/id/ALL/{z}/{x}/{y}.png');
        var secondaryRecordsUrl = allRecordsUrl + '?secondary=true';
        var allRecordsUtfGridUrl = (WebConfig.windshaft.hostname +
            '/tiles/table/grout_record/id/ALL/{z}/{x}/{y}.grid.json');
        var allBoundariesUrl = (WebConfig.windshaft.hostname +
            '/tiles/table/grout_boundary/id/ALL/{z}/{x}/{y}.png');
        var heatmapUrl = allRecordsUrl + '?heatmap=true';
        var blackspotsUrl = (WebConfig.windshaft.hostname +
                             '/tiles/table/black_spots_blackspot/id/ALL/{z}/{x}/{y}.png');
        var blackspotsUtfGridUrl = (WebConfig.windshaft.hostname +
                                    '/tiles/table/black_spots_blackspot/id/ALL/{z}/{x}/{y}.grid.json');

        var module = {
            recTilesUrl: recordsTilesUrlForType,
            secondaryTilesUrl: secondaryTilesUrlForType,
            recUtfGridTilesUrl: recordsUtfGridTilesUrlForType,
            recHeatmapUrl: recordsHeatmapTilesUrl,
            boundaryTilesUrl: boundaryTilesUrl,
            blackspotsUrl: blackspotTilesUrl,
            blackspotsUtfGridUrl: blackspotUtfGridTilesUrl
        };
        return module;

        /* Inserts an ID into a URL at the first occurrence of ALL
         *
         * param {String} url The url in which to insert the id
         * param {String} id The id to be inserted
         * returns {String} The URL with id substituted for ALL, if id is truthy
         */
        function _insertIdAtALL(url, id) {
            if (id) {
                return url.replace(/ALL/, id);
            }
            return url;
        }

        function recordsTilesUrlForType(typeUuid) {
            return _insertIdAtALL(allRecordsUrl, typeUuid);
        }

        function secondaryTilesUrlForType(typeUuid) {
            return _insertIdAtALL(secondaryRecordsUrl, typeUuid);
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
    }

    angular.module('driver.map-layers')
    .factory('TileUrlService', TileUrlService);
})();

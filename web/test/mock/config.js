(function () {
    'use strict';

    var config = {
        debug: true,
        html5Mode: {
            enabled: false,
            prefix: '!'
        },
        api: {
            hostname: 'http://localhost:7000'
        },
        windshaft: {
            hostname: 'http://localhost:7000'
        },
        nominatim: {
            key: 'abc123'
        },
        blackSpots: {
            visible: true
        },
        heatmap: {
            visible: true
        },
        interventions: {
            visible: true
        },
        record: {
            limit: 50
        },
        recordType: {
            visible: false,
            primaryLabel: 'Incident',
            secondaryLabel: 'Intervention'
        },
        localization: {
            timeZone: 'Asia/Manila',
            countryCode: 'ph',
            centerLatLon: [12.375, 121.5],
            languages: [
                { "id": "en-us", "label": "English (US)", "rtl": false },
                { "id": "ar-sa", "label": "Arabic (Saudi Arabia)", "rtl": true },
                { "id": "exclaim", "label": "Exclaim (DEV)", "rtl": false }
            ]
        }
    };

    angular.module('driver.config', [])
    .constant('WebConfig', config);
})();

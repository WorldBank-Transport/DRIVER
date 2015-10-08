(function () {
    'use strict';

    function NominatimMock () {

        var ForwardResponse = [
            {
                "boundingbox": [
                    "16.4143503",
                    "16.4146253",
                    "120.5972376",
                    "120.59762"
                ],
                "class": "building",
                "display_name": "ECCO Building, Gen Luna, Court of Appeals Compound, Prieto Compound, Baguio, Benguet, Cordillera Administrative Region, 2600, Philippines",
                "importance": 0.201,
                "lat": "16.4144883",
                "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
                "lon": "120.597430971529",
                "osm_id": "299943867",
                "osm_type": "way",
                "place_id": "183453673",
                "type": "yes"
            }
        ];

        var ReverseResponse = {
            "address": {
                "building": "ECCO Building",
                "city": "Baguio",
                "country": "Philippines",
                "country_code": "ph",
                "neighbourhood": "Court of Appeals Compound",
                "postcode": "2600",
                "road": "Gen Luna",
                "state": "Benguet",
                "suburb": "Prieto Compound"
            },
            "display_name": "ECCO Building, Gen Luna, Court of Appeals Compound, Prieto Compound, Baguio, Benguet, Cordillera Administrative Region, 2600, Philippines",
            "lat": "16.4144883",
            "licence": "Data \u00a9 OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
            "lon": "120.597430971529",
            "osm_id": "299943867",
            "osm_type": "way",
            "place_id": "183453673"
        };

        return {
            ForwardResponse: ForwardResponse,
            ReverseResponse: ReverseResponse
        };
    }

    angular.module('nominatim.mock', [])
    .factory('NominatimMock', NominatimMock);

})();

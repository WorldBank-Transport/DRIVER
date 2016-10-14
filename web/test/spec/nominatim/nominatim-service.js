'use strict';

describe('driver.nominatim: Nominatim', function () {

    beforeEach(module('nominatim.mock'));
    beforeEach(module('driver.nominatim'));

    var $httpBackend;
    var Nominatim;
    var NominatimMock;

    beforeEach(inject(function (_$httpBackend_, _Nominatim_, _NominatimMock_) {
        $httpBackend = _$httpBackend_;
        Nominatim = _Nominatim_;
        NominatimMock = _NominatimMock_;
    }));

    it('should resolve with the result from the forward geocoder', function () {
        var forwardUrl = /forward/;
        var bbox = [114.9609375,
                    17.403062993328923,
                    125.364990234375,
                    14.232437996569367];
        $httpBackend.whenGET(forwardUrl).respond(NominatimMock.ForwardResponse);
        Nominatim.forward('ECCO Building, ', bbox).then(function (result) {
            expect(result[0].display_name).toEqual('ECCO Building, Gen Luna, Court of Appeals Compound, Prieto Compound, Baguio, Benguet, Cordillera Administrative Region, 2600, Philippines');
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should resolve with the result from the reverse geocoder', function () {
        var reverseUrl = /reverse/;
        $httpBackend.whenGET(reverseUrl).respond(NominatimMock.ReverseResponse);
        Nominatim.reverse(120.597, 16.414).then(function (result) {
            expect(result.display_name).toEqual('ECCO Building, Gen Luna, Court of Appeals Compound, Prieto Compound, Baguio, Benguet, Cordillera Administrative Region, 2600, Philippines');
        });
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingRequest();
    });
});

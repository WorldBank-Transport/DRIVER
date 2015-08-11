'use strict';

describe('Leaflet: Defaults Provider', function () {

    beforeEach(module('Leaflet'));

    var LeafletDefaults;

    beforeEach(inject(function (_LeafletDefaults_) {
        LeafletDefaults = _LeafletDefaults_;
    }));

    it('should return a defaults object', function () {
        expect(LeafletDefaults.get()).toEqual(jasmine.any(Object));
    });

    it('should return a read-only defaults object', function () {
        var localDefaults = LeafletDefaults.get();
        localDefaults.newKey = 'foo';
        expect(LeafletDefaults.get()).not.toEqual(localDefaults);
    });

    /** TODO: I couldn't figure out a good way to test this; the setDefaults method
     * is only available at config-time, not via the regular injector.
    it('should provide a setDefaults provider to set defaults at config time', function () {
        var myDefaults = {
            center: [36.10, 112.10]
        };
        expect(LeafletDefaults.get()).not.toEqual(myDefaults);
        LeafletDefaultsProvider.setDefaults(myDefaults);
        expect(LeafletDefaults.get()).toEqual(myDefaults);
    });
    */
});

(function () {
    'use strict';

    /* ngInject */
    function zoomToAddress($log, Nominatim, WebConfig) {
        var module = {
            restrict: 'A',
            scope: false,
            replace: false,
            controller: '',
            require: 'leafletMap',
            link: link
        };

        return module;

        function link(scope, element, attrs, controller) {
            controller.getMap().then(function(map) {

                var latlngFromText = function(latlngText) {
                    var latlng = latlngText.split(',');
                    if (latlng.length !== 2 || isNaN(latlng[0]) || isNaN(latlng[1])) {
                        return null;
                    } else {
                        return [parseFloat(latlng[0]), parseFloat(latlng[1])];
                    }
                };

                var setLatlng = function(latlng) {
                    if (latlng === null) {
                        return;
                    }
                    map.setView([parseFloat(latlng[0]), parseFloat(latlng[1])], 16);
                };

                var geocodeAddress = function(query) {
                    Nominatim.forward(query)
                        .then(function(data) {
                            if (data.length !== 0) {
                                setLatlng([data[0].lat, data[0].lon]);
                            }
                        })
                        .catch(function(err) {
                            $log.error('Failed to get Pickpoint data:');
                            $log.error(err.status);
                            $log.error(err.data);
                        });
                };

                L.Control.AddressSearch = L.Control.extend({
                    onAdd: function() {
                        var addressSearchDiv = L.DomUtil.create('div');
                        var addressSearchInput = L.DomUtil.create('input', 'address-search-input', addressSearchDiv);
                        var addressSearchButton = L.DomUtil.create('button', 'address-search-button', addressSearchDiv);
                        L.DomUtil.create('span', 'glyphicon glyphicon-search', addressSearchButton);

                        addressSearchButton.id = 'address-search-button';
                        addressSearchInput.id = 'address-search-input';
                        addressSearchInput.placeholder = 'Zoom to';
                        addressSearchInput.type = 'text';

                        L.DomEvent.addListener(addressSearchButton, 'click', function() {
                            var addressSearchInput = document.getElementById('address-search-input').value;
                            var latlng = latlngFromText(addressSearchInput);
                            if (latlng === null) {
                                geocodeAddress(addressSearchInput);
                            } else {
                                setLatlng(latlng);
                            }
                        });

                        L.DomEvent.addListener(addressSearchInput, 'keyup', function(event) {
                            event.preventDefault();
                            if (event.keyCode === 13) {
                                document.getElementById('address-search-button').click();
                            }
                        });

                        L.DomEvent.disableClickPropagation(addressSearchDiv);

                        return addressSearchDiv;
                    }
                });

                L.control.addressSearch = function(opts) {
                    return new L.Control.AddressSearch(opts);
                };

                if (WebConfig.addressSearch.visible) {
                    L.control.addressSearch({ position: 'topleft' }).addTo(map);
                }
            });
        }
    }

    angular.module('driver.state')
        .directive('zoomToAddress', zoomToAddress);

})();

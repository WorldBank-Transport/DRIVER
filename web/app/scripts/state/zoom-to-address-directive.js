(function () {
    'use strict';

    /* ngInject */
    function zoomToAddress() {
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
                L.Control.LatLngInput = L.Control.extend({
                    onAdd: function() {
                        var latlngDiv = L.DomUtil.create('div');
                        var latlngInput = L.DomUtil.create('input', 'latlng-input', latlngDiv);
                        var latlngButton = L.DomUtil.create('button', 'latlng-button', latlngDiv);
                        L.DomUtil.create('span', 'glyphicon glyphicon-search', latlngButton);

                        latlngInput.id = 'latlng-input';
                        latlngInput.placeholder = 'Zoom to';
                        latlngInput.type = 'text';

                        L.DomEvent.addListener(latlngButton, 'click', function() {
                            var latlngInput = document.getElementById('latlng-input').value;
                            var latlng = latlngInput.split(',');
                            if (latlng.length !== 2 || isNaN(latlng[0]) || isNaN(latlng[1])) {
                                return;
                            }
                            map.setZoom(16);
                            map.panTo(new L.LatLng(parseFloat(latlng[0]), parseFloat(latlng[1])));
                        });

                        return latlngDiv;
                    }
                });

                L.control.latlngInput = function(opts) {
                    return new L.Control.LatLngInput(opts);
                };
            
                L.control.latlngInput({ position: 'topleft' }).addTo(map);
            });
        }
    }

    angular.module('driver.state')
        .directive('zoomToAddress', zoomToAddress);

})();

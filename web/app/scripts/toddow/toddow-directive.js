/**
 * This directive creates a ToDDoW calendar for aggregating information event occurrence.
 *  The bound variable `chartData` needs only be a list of objects which contain (by default)
 *  the property 'occurred_from'.
 */

(function () {
    'use strict';

    /* ngInject */
    function ToDDoW() {
        var module = {
            restrict: 'A',
            scope: {
              chartData: '=',
              dateField: '='
            },
            template: '<svg></svg>',
            link: function(scope, elem) {
                var rawSvg = elem.find('svg')[0];
                var cellSize = 26,
                    height = 210,
                    width = 660;
                var rect, color, svg, tooltip;  // GLOBAL
                init();

                /**
                 * Watch for changes to chartData and redraw and redraw and redraw
                 */
                scope.$watch('chartData', function(val) {
                    if (val) {
                        var dateField = scope.dateField ? scope.dateField : 'occurred_from';
                        var data = formatData(val, dateField);
                        color = d3.scale.linear()
                            .domain([0, d3.max(d3.values(data))])
                            .interpolate(d3.interpolateRgb)
                            .range(['#ffffff', '#355e3b']);
                        updateChart(data);
                    }
                });

                /**
                 * Initialize graph to make clean updates possible in a separate, 'updateChart',
                 *  function. Grab the SVG, manipulate it, generate tooltips, gather rectangle
                 *  elements together under `rect`.
                 */
                function init() {
                    svg = d3.select(rawSvg)
                        .attr('width', width)
                        .attr('height', height)
                        .attr('fill', 'grey');

                    svg.append('text')
                        .attr('transform', 'translate(-6,' + cellSize * 3.5 + ')rotate(-90)')
                        .style('text-anchor', 'middle')
                        .text(function(d) { return d; });

                    var theDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    var theHours = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
                                    '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
                                    '12'];

                    rect = svg.selectAll('.day')
                        .data(theDays)
                            .enter().append('g')
                            .attr('class', 'day')
                            .attr('data-day', function(d, i) {
                                return theDays[i];
                            })
                        .selectAll('.hour')
                        .data(function(d, i) {
                            var weekStart = d3.time.week(new Date());
                            return d3.time.hours(moment(weekStart).add(i, 'days').toDate(), moment(weekStart).add(i + 1, 'days').toDate()); })
                        .enter().append('g').append('rect')
                            .attr('class', 'hour')
                            .attr('fill', 'white')
                            .attr('stroke', 'white')
                            .attr('width', cellSize)
                            .attr('height', cellSize)
                            .attr('x', function(d, i) { return cellSize * i + 30; })
                            .attr('y', function(d, i, j) { return j * cellSize + 20; })
                            .attr('data-duration', function(d, i) {
                                var time = (i <= 11) ? 'am' : 'pm';
                                return theHours[i] + '-' + theHours[i + 1] + time;
                            });

                    // Day labels
                    svg.selectAll('.day')
                        .append('text')
                          .text(function(d, i) { return theDays[i]; })
                          .attr('class', 'label month')
                          .attr('x', 0)
                          .attr('y', function(d, i) { return i * cellSize + 40; });

                    svg.select('.day').selectAll('g')
                        .append('text')
                            .text(function(d, i) {
                                if(i === 0) {
                                    return theHours[i] + 'am';
                                } else if (i === 12) {
                                    return theHours[i] + 'pm';
                                } else if (i === 24) {
                                    return theHours[i] + 'am';
                                } else {
                                    return theHours[i];
                                }
                            })
                            .attr('class', 'label hours')
                            .attr('x', function(d, i) {
                                var labelVal = theHours[i];
                                if(typeof labelVal === 'number') {
                                    return i * cellSize + 27;
                                } else {
                                    return i * cellSize + 22;
                                }
                            })
                            .attr('y', 10);

                    tooltip = d3.tip()
                    rect.attr('data-hour', function(d) { return formatHourRange(d); })
                        .datum(formatHourRange)
                        .on('mouseover', tooltip.show)
                        .on('mouseout', tooltip.hide);

                }

                /**
                 * Update all fields of chart with new information and draw in cells with events
                 */
                function updateChart(data) {
                    tooltip.html(function(d) {
                      var tooltipText = data[d] ? data[d] : '0';
                      return 'Event count: ' + tooltipText;
                    });
                    svg.call(tooltip);
                    rect.attr('fill', 'white');
                    rect.filter(function(d) { return d in data; })
                        .attr('fill', function(d) { return color(data[d]); });
                }

                /**
                 * Helper function to format datetime strings
                 */
                function formatHourRange(time) {
                    return moment(time).format('e:H') + '-' + (+moment(time).format('H') + 1);
                }

                /**
                 * Helper function to gather data together into a format more friendly to D3
                 */
                function formatData(events, dateField) {
                    /* jshint camelcase: false */
                    return d3.nest()
                        .key(function(d) { return formatHourRange(d[dateField]); })
                        .rollup(function(leaves) { return leaves.length; })
                        .map(events);
                    /* jshint camelcase: true */
                }
            }
        };
        return module;
    }

    angular.module('driver.toddow')
    .directive('driverToddow', ToDDoW);

})();

/**
 * This directive creates a ToDDoW calendar for aggregating information event occurrence.
 *  The bound variable `chartData` needs only be a list of objects which contain (by default)
 *  the property 'occurred_from'.
 */

(function () {
    'use strict';

    /* ngInject */
    function ToDDoW($translate, LanguageState) {
        // The color ramp to use
        var rampValues = ['#FDFBED', '#f6edb1', '#f7da22', '#ecbe1d', '#e77124',
                          '#d54927', '#cf3a27', '#a33936', '#7f182a', '#68101a'];
        var module = {
            restrict: 'E',
            scope: {
              chartData: '='
            },
            template: '<svg></svg>',
            link: function(scope, elem) {
                var rawSvg = elem.find('svg')[0];
                var cellSize = 26,
                    height = 210,
                    width = 660;
                var rect, color, svg;  // GLOBAL
                var tooltip = d3.tip();
                tooltip.offset(function() { return [-16, -18]; });

                $translate.onReady(init);

                /**
                 * Initialize graph to make clean updates possible in a separate, 'updateChart',
                 *  function. Grab the SVG, manipulate it, generate tooltips, gather rectangle
                 *  elements together under `rect`.
                 */
                function init() {
                    var isRightToLeft = LanguageState.getSelected().rtl;

                    /**
                     * Watch for changes to chartData and redraw
                     */
                    scope.$watch('chartData', function(val) {
                        if (val) {
                            var data = formatData(val, isRightToLeft);
                            color = d3.scale.quantile()
                                .domain([0, _.max(val, function(x) { return x.count; }).count])
                                .range(rampValues);
                            updateChart(data);
                        }
                    });

                    svg = d3.select(rawSvg)
                        .attr('viewBox', '0 0 ' + width + ' ' + height)
                        .attr('preserveAspectRatio', 'xMinYMin')
                        .attr('fill', 'grey');

                    svg.append('text')
                        .attr('transform', 'translate(-6,' + cellSize * 3.5 + ')rotate(-90)')
                        .style('text-anchor', 'middle')
                        .text(function(d) { return d; });

                    var theDays = _.map([
                        'DAY.SUN',
                        'DAY.MON',
                        'DAY.TUE',
                        'DAY.WED',
                        'DAY.THU',
                        'DAY.FRI',
                        'DAY.SAT'
                    ], function(dayKey) {
                        return $translate.instant(dayKey);
                    });

                    var theHours = _.range(24);
                    if (isRightToLeft) {
                        theHours = _(theHours).reverse().value();
                    }

                    rect = svg.selectAll('.day')
                        .data(theDays)
                            .enter().append('g')
                            .attr('class', 'day')
                            .attr('data-day', function(d, i) {
                                return theDays[i];
                            })
                        .selectAll('.hour')
                        .data(function(d, i) {
                            /**
                             * We use 01/01/2001 for construction of our week to avoid daylight
                             *  savings time weirdness
                            **/
                            var weekStart = d3.time.week(new Date('01/01/2001'));
                            return d3.time.hours(
                              moment(weekStart).add(i, 'days').toDate(),
                              moment(weekStart).add(i + 1, 'days').toDate()
                            );
                        })
                        .enter().append('g').append('rect')
                            .attr('class', 'hour')
                            .attr('fill', 'white')
                            .attr('stroke', 'white')
                            .attr('width', cellSize)
                            .attr('height', cellSize)
                            .attr('x', function(d, i) {
                                return cellSize * i + (isRightToLeft ? 0 : 30);
                            })
                            .attr('y', function(d, i, j) { return j * cellSize + 20; });

                    // Day labels
                    svg.selectAll('.day')
                        .append('text')
                          .text(function(d, i) { return theDays[i]; })
                          .attr('class', 'label')
                          .attr('x', isRightToLeft ? 652 : 0)
                          .attr('y', function(d, i) { return i * cellSize + 40; });

                    svg.select('.day').selectAll('g')
                        .append('text')
                            .text(function(d, i) { return theHours[i]; })
                            .attr('class', 'label hours')
                            .attr('x', function(d, i) {
                                return i * cellSize + (isRightToLeft ? 17 : 37);
                            })
                            .attr('y', 10);

                    // Use try/catch pattern here to prevent unecessary logging before data loads
                    rect.attr('data-hour', function(d) { formatHourRange(d); })
                        .datum(formatHourRange)
                        .on('mouseover', function(d) { try { tooltip.show(d); } catch(e) {} })
                        .on('mouseout', tooltip.hide);


                }

                /**
                 * Update all fields of chart with new information and draw in cells with events
                 */
                function updateChart(data) {
                    svg.call(tooltip);
                    tooltip.html(function(d) {
                      var tooltipText = data[d] || '0';
                      return $translate.instant('RECORD.EVENT_COUNT') + ': ' + tooltipText;
                    });
                    rect.attr('fill', '#f1f2f2');
                    rect.filter(function(d) { return data.hasOwnProperty(d); })
                        .attr('fill', function(d) { return color(data[d]); });
                }

                /**
                 * Helper function to format datetime strings
                 */
                function formatHourRange(time) {
                    return moment(time).format('H') + ':' + (+moment(time).format('e') + 1);
                }

                /**
                 * Helper function to gather data together into a format more friendly to D3
                 */
                function formatData(events, isRightToLeft) {
                    var holder = {};
                    _.each(events, function(val) {
                        var tod = isRightToLeft ? 23 - val.tod : val.tod;
                        holder[tod + ':' + val.dow] = val.count;
                    });
                    return holder;
                }
            }
        };
        return module;
    }

    angular.module('driver.toddow')
    .directive('driverToddow', ToDDoW);

})();

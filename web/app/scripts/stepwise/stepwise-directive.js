/**
 * This directive creates a stepwise graph for aggregating information event occurrence.
 *  The bound variable `chartData` needs only be a list of objects which contain (by default)
 *  the property 'occurred_from'.
 */

(function() {
    'use strict';

    /* ngInject */
    function Stepwise($translate, $window, LanguageState, DateLocalization) {
        var module = {
            restrict: 'E',
            scope: {
                chartData: '<',
                minDate: '<',
                maxDate: '<',
                inDashboard: '<'
            },
            link: function(scope, element) {
                // Need to set after initialization to guarantee translations are available
                $translate.onReady(init);

                /**
                 * Set up listeners for data and draw area size
                 */
                function init() {
                    var isRightToLeft = LanguageState.getSelected().rtl;
                    var svg = d3.select(element[0])
                        .append('svg')
                        .attr('width', '100%')
                        .attr('height', '100%');

                    //re-render on window resize
                    $(window).resize('resize.doResize', function() {
                        render(svg, element, scope.chartData, isRightToLeft);
                    });
                    scope.$on('$destroy', function() {
                        $(window).off('resize.doResize');
                    });

                    // Watch for changes to chartData and redraw
                    scope.$watch('chartData', function(newVal) {
                        if (newVal) {
                            render(svg, element, newVal, isRightToLeft);
                        }
                    });
                }

                /**
                 * Render the chart.
                 * While updating the chart incrementally may yield better
                 * performance, it makes deciphering the state of the chart
                 * more difficult and results in a bunch of ugly global state
                 */
                function render(svg, element, data, isRightToLeft) {
                    var formattedData = formatData(data);
                    svg.selectAll('*').remove();
                    var d3Container = d3.select(element[0])[0][0];

                    var dimensions = {
                        width: d3Container.offsetWidth - 40,
                        height: d3Container.offsetHeight - 15
                    };
                    if (!scope.inDashboard) {
                        // Chart is being rendered in a hidden div, which only happens
                        // when in the map view. The container has a set size, so just
                        // use that (adjusted for margins etc.)
                        dimensions.width = 535;
                        dimensions.height = 185;
                    }

                    var offsets = {
                        container: {
                            x: (scope.inDashboard ? 45 : 25),
                            y: 15
                        },
                        xAxis: {
                            x: 5
                        },
                        yAxis: {
                            x: (isRightToLeft ? 70 : 5),
                            y: -10
                        },
                        yAxisText: {
                            x: (isRightToLeft ? 45 : 30),
                            y: 0
                        }
                    };
                    offsets.xAxis.y = dimensions.height - offsets.container.y - 10;

                    var xRange;
                    if (isRightToLeft) {
                        xRange = [dimensions.width - offsets.yAxis.x, offsets.xAxis.x];
                    } else {
                        xRange = [offsets.xAxis.x, dimensions.width - offsets.yAxis.x];
                    }

                    var axisScales = {
                        tScale: d3.time.scale().range(xRange),
                        x: d3.scale.ordinal().rangeBands(xRange, 0.05),
                        y: d3.scale.linear().range(
                            [dimensions.height, offsets.container.y - offsets.yAxis.y]
                        )
                    };
                    axisScales.tScale.domain(formattedData.tScale);
                    axisScales.x.domain(formattedData.x);
                    axisScales.y.domain(formattedData.y);

                    var xAxis = createXAxis(axisScales.tScale);
                    var yAxis = createYAxis(axisScales.y, data);

                    var outerContainer = createOuterContainer(svg, offsets.container);

                    var yAxisContainer = createYAxisContainer(
                        outerContainer, dimensions, offsets, isRightToLeft
                    );
                    addYAxisToContainer(
                        yAxisContainer, yAxis, dimensions, offsets, isRightToLeft
                    );
                    var xAxisContainer = createXAxisContainer(outerContainer, offsets.xAxis);
                    addXAxisToContainer(xAxisContainer, xAxis, isRightToLeft);

                    var tooltip = createTooltip();
                    outerContainer.call(tooltip);

                    addDataBars(
                        outerContainer, formattedData, axisScales, dimensions, offsets, tooltip
                    );
                }

                function createXAxis(tScale) {
                    var xAxis = d3.svg.axis()
                        .scale(tScale)
                        .tickFormat(function(d) {
                            return DateLocalization.getLocalizedDateString(d, 'short');
                        })
                        .ticks(5)
                        .tickSize(1)
                        .orient('bottom');
                    return xAxis;
                }

                function createYAxis(yScale, data) {
                    var maxCount = _.max(_.map(data, function(d) {
                        return d.count;
                    }));
                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('left')
                        .tickSize(1)
                        .ticks(Math.min(10, Math.max(2, maxCount)));
                    return yAxis;
                }

                function createOuterContainer(svg, containerOffset) {
                    var outer = svg.append('g')
                        .attr('class', 'outer')
                        .attr(
                            'transform',
                            'translate(' + containerOffset.x + ',' + containerOffset.y + ')'
                        );
                    return outer;
                }

                function createYAxisContainer(outer, dimensions, offsets, isRightToLeft) {
                    var yAxisOffset = offsets.yAxis;
                    var containerOffset = offsets.container;
                    var yAxisContainer = outer.append('g')
                        .attr('class', 'yAxis')
                        .attr('transform', 'translate(' +
                            (isRightToLeft ? dimensions.width - yAxisOffset.x : yAxisOffset.x) + ', ' +
                            (yAxisOffset.y - containerOffset.y) + ')');
                    return yAxisContainer;
                }

                function addYAxisToContainer(
                    yAxisContainer, yAxis, dimensions, offsets, isRightToLeft
                ) {
                    yAxisContainer.call(yAxis)
                        .attr('x', -100)
                        .selectAll('text')
                        .attr('text-anchor', 'right')
                        .attr('x', (isRightToLeft ? 5 : -5))
                        .attr('dy', 0);
                    if (scope.inDashboard) {
                        yAxisContainer
                            .append('text')
                            .attr('text-anchor', 'middle')
                            .attr('transform',
                                'translate(' +
                                (isRightToLeft ? offsets.yAxisText.x : -offsets.yAxisText.x) +
                                ',' + (dimensions.height / 2 - 2 * offsets.yAxis.y) + ')rotate(-90)')
                            .text($translate.instant('DASHBOARD.STEPWISE_TITLE'));
                    }
                }

                function createXAxisContainer(outer, xAxisOffset) {
                    var xAxisContainer = outer.append('g')
                        .attr('class', 'xAxis')
                        .attr('transform', 'translate(0,' + xAxisOffset.y + ')');
                    return xAxisContainer;
                }

                function addXAxisToContainer(xAxisContainer, xAxis, isRightToLeft) {
                    xAxisContainer
                        .call(xAxis)
                        .selectAll('text')
                        .attr('class', 'label')
                        .style('text-anchor', 'end')
                        .attr('dx', isRightToLeft ? '-2em' : '1.5em')
                        .attr('dy', '1em');
                }

                function createTooltip() {
                    var tooltip = d3.tip().html(function(d) {
                        return '<strong>' +
                            $translate.instant('RECORD.WEEK_OF') +
                            ': </strong>' +
                            DateLocalization.getLocalizedDateString(d.dt, 'long') +
                            '</br><strong>' +
                            $translate.instant('RECORD.EVENT_COUNT') +
                            ':</strong> <span>' +
                            d.count +
                            '</span>';
                    }).offset([-20, -15]);
                    return tooltip;
                }

                function addDataBars(
                    outerContainer, formattedData, axisScales, dimensions, offsets, tooltip
                ) {
                    outerContainer.selectAll('bar')
                        .attr('class', 'test')
                        .data(formattedData.temporal)
                        .enter().append('rect')
                        .style('fill', '#337ab7')
                        .attr('data-date', function(d) {
                            return d.dt.toLocaleDateString();
                        })
                        .attr('class', 'bar')
                        .attr('x', function(d) {
                            return axisScales.x(d.dt.toLocaleDateString());
                        })
                        .attr('width', axisScales.x.rangeBand() * 0.8)
                        .attr('y', function(d) {
                            return axisScales.y(d.count) - (dimensions.height - offsets.xAxis.y);
                        })
                        .attr('height', function(d) {
                            return dimensions.height - axisScales.y(d.count);
                        })
                        .on('mouseover', tooltip.show)
                        .on('mouseout', tooltip.hide);
                }

                /**
                 * Helper function to gather data together into a format more friendly to D3
                 */
                function formatData(data) {
                    var formattedData = {};
                    // moment() defines week 1 of 2016 as the week of December 27 2015 (first week with a 2016 date)
                    // we define it as the week of Jan 3, 2016 (first full week)
                    formattedData.moment = _.map(data, function(d) {
                        return {
                            'dt': moment().year(d.year).week(d.week + 1),
                            'count': d.count
                        };
                    });
                    var allWeeks = weekRange(formattedData.moment);
                    var maxCount = _.max(data, function(d) {
                        return d.count;
                    }).count || 10;

                    // Set the domain for our X scale - it NEEDS to be at a lower precision than
                    //  seconds to prevent behavioral abnormalities
                    formattedData.tScale = [
                        new Date(allWeeks[0]),
                        new Date(allWeeks[allWeeks.length - 1])
                    ];
                    formattedData.x = _.map(allWeeks, function(d) {
                        return d.toLocaleDateString();
                    });
                    formattedData.y = [0, maxCount];

                    // Produce the base array of objects
                    formattedData.temporal =
                        _.uniq(
                            _.map(formattedData.moment, function(d) {
                                return {
                                    'dt': getWeek(d.dt.toDate()),
                                    'count': d.count
                                };
                            }).concat(
                                _.map(allWeeks, function(d) {
                                    return {
                                        'dt': getWeek(d),
                                        'count': 0
                                    };
                                })
                            ),
                            function(d) {
                                return d.dt.toLocaleDateString();
                            }
                        );
                    return formattedData;
                }

                function getWeek(datetimeISO) {
                    return d3.time.week(new Date(datetimeISO));
                }

                /**
                 * Helper function for producing an array of all the weeks between the earliest
                 *  and the latest dates in the provided datetimes
                 *
                 *  @param dts {object} A datetime object having (at least) the form:
                 *                       [{'dt': <moment datetime object>},...]
                 */
                function weekRange(dts) {
                    // Get earliest and latest weeks
                    var justDT = _.map(dts, function(d) {
                        return d.dt;
                    });
                    // minDT and maxDT will use the filter data and fall back on non-zero data they
                    // receive from the server
                    var minDT, maxDT;
                    if (scope.minDate) {
                        minDT = moment(d3.time.week(new Date(scope.minDate)));
                    } else {
                        minDT = moment.min(justDT);
                    }

                    if (scope.maxDate) {
                        maxDT = moment(d3.time.week(new Date(scope.maxDate)));
                    } else {
                        maxDT = moment.max(justDT);
                    }

                    // We need to iterate through weeks between the earliest and the latest so that
                    //  we might properly zero-fill the empty data
                    var arr = [];
                    var maxUnix = maxDT.unix();
                    for (var i = minDT.clone(); i.unix() <= maxUnix; i = i.clone().add(1, 'week')) {
                        // Call `toDate` for D3 axis consumption
                        arr.push(getWeek(i.toDate()));
                    }
                    return arr;
                }
            }
        };
        return module;
    }

    angular.module('driver.stepwise')
        .directive('driverStepwise', Stepwise);

})();

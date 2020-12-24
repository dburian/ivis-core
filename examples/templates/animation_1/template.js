'use strict';

import React, {Component} from 'react';
import moment from 'moment';
import {
    RecordedAnimation,
    OnelineLayout,
    animated,
    AreaChart,
    StaticBarChart,
    StaticLegend,
    withPanelConfig,
    linearInterpolation,
    cubicInterpolation,
    expensiveCubicInterpolation,
    TimeRangeSelector,
    IntervalSpec
} from 'ivis';
import PropTypes from 'prop-types';

import styles from './styles.scss';

const areaChartDtSourceKey = 'areachart_dt';
const barChartDtSourceKey = 'barchart_dt';

const AnimatedBarChart = animated(StaticBarChart);
class BarChartSection extends Component {
    static propTypes = {
        categories: PropTypes.array,
        dataSets: PropTypes.array,

        domainLabel: PropTypes.string,
        codomainLabel: PropTypes.string,

        valueFormatSpecifier: PropTypes.string,
    }

    getBarChartConfig() {
        const config = {
            groups: [],
        };

        const colors = {};
        for (const cat of this.props.categories) {
            colors[cat.id] = cat.color;
        }

        for (const dataSet of this.props.dataSets) {
            const group = {
                label: dataSet.name,
                colors: dataSet.categories.map(c => colors[c.categoryId]),
                values: dataSet.categories.map(c => ({
                    sigSetCid: dataSet.sigSetCid,
                    signalCid: c.cid,
                    agg: 'avg'
                })),
            };

            config.groups.push(group);
        }

        return config;
    }

    render() {
        const structure = [
            {
                labelAttr: 'label',
                colorAttr: 'color',
            },
        ];
        const isHorizontal = this.props.dataSets.length > 4;
        const height = isHorizontal ?
            this.props.dataSets.length * this.props.categories.length * 35 :
            600
        ;

        return (
            <div className="px-1 text-center">
                <AnimatedBarChart
                    dataSourceKey={barChartDtSourceKey}
                    height={height}
                    padding={{
                        bottom: 30,
                        top: 10,
                        left: 100,
                        right: 70,
                    }}
                    isHorizontal={isHorizontal}
                    domainLabel={this.props.domainLabel}
                    codomainLabel={this.props.codomainLabel}
                    config={this.getBarChartConfig()}

                    withTickLines
                    withBarValues

                    valueFormatSpecifier={this.props.valueFormatSpecifier}
                />

                <StaticLegend
                    structure={structure}
                    config={this.props.categories}
                    rowClassName={"col " + styles.legendRow}
                    />
            </div>
        );
    }
}

const AnimatedAreaChart = animated(AreaChart);
class AreaChartSection extends Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
    }

    render() {
        const config = {
            yAxes: [{visible: true, belowMin: 0.1, aboveMax: 0.2}],
            signalSets: this.props.config.sigSets,
        };

        return (
            <div className="container-fluid">
                <AnimatedAreaChart
                    dataSourceKey={areaChartDtSourceKey}
                    config={config}
                    height={500}
                />
            </div>
        );
    }
}

@withPanelConfig
export default class Panel extends Component {
    getAnimationConfig() {
        const ac = this.getPanelConfig(['animationConfig']);
        const dataSources = {};

        const barChartDtSets = this.getPanelConfig(['barchart', 'dataSets']);
        dataSources[barChartDtSourceKey] = {
            type: 'generic',
            interpolation: expensiveCubicInterpolation,

            sigSets: barChartDtSets.map(dtSet => ({
                cid: dtSet.sigSetCid,
                tsSigCid: dtSet.tsSigCid,
                signals: dtSet.categories
            })),
        };

        const areaChartSigSets  = this.getPanelConfig(['areachart', 'sigSets']);
        dataSources[areaChartDtSourceKey] = {
            type: 'timeSeries',
            interpolation: cubicInterpolation,

            signalAggs: ['max'],
            sigSets: areaChartSigSets,
        }


        return {
            initialStatus: ac.initialStatus && {
                isPlaying: !!ac.initialStatus.isPlaying,
                playbackSpeedFactor: ac.initialStatus.playbackSpeedFactor,
            },
            dataSources,
            initialIntervalSpec: new IntervalSpec('2020-02-20 00:00:00', 'now', null, null),
        };
    }

    getControlsConfig() {
        const config = this.getPanelConfig(['animationConfig', 'controls']);

        if (config.timeline.positionFormatString.length === 0) {
            config.timeline.positionFormatString = undefined;
        }

        const changeSpeedSteps = config.changeSpeed.steps;
        if (changeSpeedSteps.length === 0) {
            config.changeSpeed.steps = undefined;
        } else {
            config.changeSpeed.steps = changeSpeedSteps.map(step => step.step);
        }

        if (Number.isNaN(config.jumpForward.jumpFactor))
            config.jumpForward.jumpFactor = undefined;
        if (Number.isNaN(config.jumpBackward.jumpFactor))
            config.jumpBackward.jumpFactor = undefined;

        return config
    }

    render() {
        return (
            <RecordedAnimation {...this.getAnimationConfig()}>
                <TimeRangeSelector />
                <OnelineLayout {...this.getControlsConfig()} />

                <AreaChartSection config={this.getPanelConfig(['areachart'])} />
                <hr />
                <BarChartSection
                    domainLabel={this.getPanelConfig(['barchart', 'domainLabel'])}
                    codomainLabel={this.getPanelConfig(['barchart', 'codomainLabel'])}
                    valueFormatSpecifier={this.getPanelConfig(['barchart', 'valueFormatSpecifier'])}
                    categories={this.getPanelConfig(['barchart', 'categories'])}
                    dataSets={this.getPanelConfig(['barchart', 'dataSets'])}
                    />
            </RecordedAnimation>
        );
    }
}

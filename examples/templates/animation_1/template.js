'use strict';

import React, {Component} from 'react';
import moment from 'moment';
import {
    RecordedAnimation,
    OnelineLayout,
    animated,
    LineChart,
    SimpleBarChart,
    StaticLegend,
    withPanelConfig,
    linearInterpolation,
    cubicInterpolation,
    expensiveCubicInterpolation,
    TimeRangeSelector,
} from 'ivis';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const lineChartDtSourcePrefix = 'linechart_';
const barChartDtSourcePrefix = 'barchart_';

class PanelIntroduction extends Component {
    static propTypes = {
        header: PropTypes.string,
        desc: PropTypes.string,
    }

    render() {

        return (
            <>
                <div className="jumbotron rounded-lg mb-5 p-4">
                    <h1 className="display-4 mb-5">
                        {this.props.header}
                    </h1>
                    <p className="text-justify lead">
                        {this.props.desc}
                    </p>
                </div>
                <hr />
            </>
        );
    }
}

class BarChartIntroduction extends Component {
    static propTypes = {
        categories: PropTypes.array.isRequired,
        chartDesc: PropTypes.string.isRequired,
        chartLabel: PropTypes.string.isRequired,
    }

    render() {
        const renderCategory = (category) => {
            return (
                <div key={category.id} className="callout" style={{borderColor: category.color}}>
                    <h5>{category.label}</h5>
                    <p className="text-justify">{category.desc}</p>
                </div>
            );
        };

        return (
            <div className="mb-5 p-4">
                <h2 className="text-center mb-5">{this.props.chartLabel}</h2>
                <p className="text-justify mb-2">
                    {this.props.chartDesc}
                </p>
                <h5>Bar categories:</h5>
                {this.props.categories.map(renderCategory)}
            </div>
        );
    }
}

const AnimatedBarChart = animated(SimpleBarChart);
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
                    dataSource: barChartDtSourcePrefix + dataSet.sigSetCid,
                    signal: c.cid,
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

const AnimatedLineChart = animated(LineChart);
class LineChartSection extends Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
    }

    render() {
        const config = {
            yAxes: [{visible: true, belowMin: 0.1, aboveMax: 0.2}],
            signalSets: this.props.config.dataSets,
        };

        return (
            <div className="container-fluid">
                <AnimatedLineChart
                    config={config}
                    height={500}
                    withTooltip
                    animationDataFormatter={data => {
                        const dtSrces = Object.keys(data)
                            .filter(dtSrcKey => dtSrcKey.startsWith(lineChartDtSourcePrefix))
                            .map(dtSrcKey => data[dtSrcKey]);

                        return [Object.assign({}, ...dtSrces)];
                    }}
                />
            </div>
        );
    }
}

@withPanelConfig
export default class Panel extends Component {
    getAnimationConfig() {
        const c = this.getPanelConfig(['animationConfig']);
        const barChartDtSets = this.getPanelConfig(['barchart', 'dataSets']);

        const dataSources = {};
        for (const dtSet of barChartDtSets) {
            const signals = {};
            for (const sigCid of dtSet.categories.map(c => c.cid)) {
                signals[sigCid] = ['avg'];
            }

            dataSources[barChartDtSourcePrefix + dtSet.sigSetCid] = {
                type: 'generic',
                interpolation: expensiveCubicInterpolation,
                withHistory: false,

                sigSetCid: dtSet.sigSetCid,
                signals,
                tsSigCid: dtSet.tsSigCid,
            };
        }


        const lineChartDtSets = this.getPanelConfig(['linechart', 'dataSets']);
        for (const dtSet of lineChartDtSets) {
            const signals = {};
            for (const sigCid of dtSet.signals.map(s => s.cid)) {
                signals[sigCid] = ['min', 'max', 'avg'];
            }

            dataSources[lineChartDtSourcePrefix + dtSet.cid] = {
                type: 'timeSeries',
                interpolation: cubicInterpolation,

                sigSetCid: dtSet.cid,
                tsSigCid: dtSet.tsSigCid,
                signals,
            }
        }


        return {
            refreshRate: c.refreshRate,
            initialStatus: c.initialStatus && {
                isPlaying: !!c.initialStatus.isPlaying,
                position: c.initialStatus.positionISO && moment.utc(c.initialStatus.positionISO).valueOf(),
                playbackSpeedFactor: c.initialStatus.playbackSpeedFactor,
            },
            dataSources
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
        const categories = this.getPanelConfig(['barchart', 'categories']);

        return (
            <>
                <PanelIntroduction
                    header={this.getPanelConfig(['pageHeader'])}
                    desc={this.getPanelConfig(['pageDesc'])}
                />

                <RecordedAnimation {...this.getAnimationConfig()}>
                    <TimeRangeSelector />
                    <OnelineLayout {...this.getControlsConfig()} />
                    <LineChartSection
                        config={this.getPanelConfig(['linechart'])}
                    />
                    <hr />
                    <BarChartIntroduction
                        categories={categories}
                        chartLabel={this.getPanelConfig(['barchart', 'chartLabel'])}
                        chartDesc={this.getPanelConfig(['barchart', 'chartDesc'])}
                    />
                    <BarChartSection
                        domainLabel={this.getPanelConfig(['barchart', 'domainLabel'])}
                        codomainLabel={this.getPanelConfig(['barchart', 'codomainLabel'])}
                        valueFormatSpecifier={this.getPanelConfig(['barchart', 'valueFormatSpecifier'])}
                        categories={categories}
                        dataSets={this.getPanelConfig(['barchart', 'dataSets'])}
                        />
                </RecordedAnimation>
            </>
        );
    }
}

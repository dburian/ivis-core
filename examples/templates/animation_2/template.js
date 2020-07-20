'use strict';

import React, {Component} from 'react';
import moment from 'moment';
import {select, event} from 'd3-selection';
import {scaleTime, scaleLinear} from 'd3-scale';
import {zoom, zoomTransform} from 'd3-zoom';
import {extent} from 'd3-array';
import {
    RecordedAnimation,
    OnelineLayout,
    animated,
    LineChart,
    StaticPieChart,
    LegendPosition,
    withPanelConfig,
    linearInterpolation,
    cubicInterpolation,
    expensiveCubicInterpolation,
    TimeRangeSelector,
    SVG,
} from 'ivis';
import PropTypes from 'prop-types';
import styles from './styles.scss';

const pieChartDtSourcePrefix = 'piechart_';
const lineChartDtSourcePrefix = 'lineChart_';
const svgChartDtSourcePrefix = 'svgChart_';

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

const AnimatedLineChart = animated(LineChart);
class LineChartSection extends Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
    }

    render() {
        const config = {
            yAxes: [{visible: true, belowMin: 0.1, aboveMax: 0.2}],
            signalSets: this.props.config.dataSets
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

class PieChartIntroduction extends Component {
    static propTypes = {
        sectors: PropTypes.array.isRequired,
        chartDesc: PropTypes.string.isRequired,
        chartLabel: PropTypes.string.isRequired,
    }

    render() {
        const renderSector = (sector) => {
            return (
                <div key={sector.id} className="callout" style={{borderColor: sector.color}}>
                    <h5>{sector.label}</h5>
                    <p className="text-justify">{sector.desc}</p>
                </div>
            );
        };

        return (
            <div className="mb-5 p-4">
                <h2 className="text-center mb-5">{this.props.chartLabel}</h2>
                <p className="text-justify mb-2">
                    {this.props.chartDesc}
                </p>
                <h5>Pie chart sectors:</h5>
                {this.props.sectors.map(renderSector)}
            </div>
        );
    }
}

class PieChartsSection extends Component {
    static propTypes = {
        sectors: PropTypes.array.isRequired,
        dataSets: PropTypes.array.isRequired,
    }

    getPieChartsProps() {
        const colors = {};
        const labels = {};
        for (const secConf of this.props.sectors) {
            colors[secConf.id] = secConf.color;
            labels[secConf.id] = secConf.label;
        }

        const pieChartProps = [];
        for (const dtSet of this.props.dataSets) {
            const arcs = [];
            for(const sector of dtSet.sectors) {
                arcs.push({
                    color: colors[sector.sectorId],
                    label: labels[sector.sectorId],
                    dataSource: pieChartDtSourcePrefix + dtSet.sigSetCid,
                    signal: sector.cid,
                    agg: 'avg'
                });
            }

            const props = {
                key: dtSet.sigSetCid,
                label: dtSet.name,
                arcs,
            };
            pieChartProps.push(props);
        }

        return pieChartProps;
    }

    render() {
        const pieChartsProps = this.getPieChartsProps();
        return (
            <div className="container-fluid">
                <div className="row">
                    {pieChartsProps.map(props => <SinglePieChartSection {...props} />)}
                </div>
            </div>
        );
    }
}

const AnimatedPieChart = animated(StaticPieChart);
class SinglePieChartSection extends Component {
    static propTypes = {
        label: PropTypes.string,
        arcs: PropTypes.array,
    }

    render() {
        return (
            <div className="col-6">
                <h4 className="text-center">{this.props.label}</h4>
                <AnimatedPieChart
                    config={{arcs: this.props.arcs}}
                    height={150}
                    legendPosition={LegendPosition.BOTTOM}
                    legendRowClass={"col " + styles.pieChartLegend}
                />
            </div>
        );
    }
}

class SVGChart extends Component {
    static propTypes = {
        config: PropTypes.object,
        data: PropTypes.object,
        height: PropTypes.number,
    }

    constructor(props) {
        super(props);

        this.noData = true;
        this.boundUpdateDots = ::this.updateDots;
        this.resizeListener = ::this.updateContainerWidth;
        this.svgImg = `
        <svg id="svg" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">
            <g id="content">
                <g id="grid">
                    <g id="horizontal"/>
                    <g id="vertical"/>
                </g>
                <g id="dots"></g>
            </g>
            <g id="legend" x="0" y="0"/>
            <text id="message" fill="black" x="50%" y="50%" />
        </svg>`;

        this.state = {
            width: null,
        };
    }

    updateContainerWidth() {
        const rect = this.containerNode.getClientRects()[0];

        this.setState({
            width: rect.width,
        });
    }

    componentDidMount() {
        this.resizeListener();
        window.addEventListener('resize', this.resizeListener);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
    }

    updateDots(dotsSel) {
        const messageSel = this.svgSel.select('#message');
        const gridSel = this.svgSel.select('#grid');
        const legendSel = this.svgSel.select('#legend');

        const conf = this.props.config;
        const data = this.props.data;

        const width = this.state.width;
        const height = this.props.height;

        const getCoordsFromLineConf = (lineConf) => (
            data[lineConf.dataSource]
                .map(kf => ({x: kf.ts, y: kf.data[lineConf.signal][lineConf.agg]}))
                .filter(({x, y}) => x !== null && y !== null)
        );

        let yExtents = [];
        let xExtents = [];
        for (const lineConf of conf.lines) {
            yExtents = extent([...yExtents, ...getCoordsFromLineConf(lineConf).map(c => c.y)]);
            xExtents = extent([...xExtents, ...getCoordsFromLineConf(lineConf).map(c => c.x)]);
        }

        if (yExtents.every(v => v === undefined)) {
            messageSel.text('No data.');
            return;
        }

        messageSel.text(null);


        const yExtremesSpan = yExtents[1] - yExtents[0];
        const xExtremesSpan = xExtents[1] - xExtents[0];

        const y = scaleLinear()
            .domain([yExtents[0] - 0.5*yExtremesSpan, yExtents[1] + 0.5*yExtremesSpan])
            .range([height, 0]);

        const x = scaleTime()
            .domain([xExtents[0] - 0.5*xExtremesSpan, xExtents[1] + 0.5*xExtremesSpan])
            .range([0, width]);

        gridSel.select('#vertical')
            .selectAll('line')
            .data(x.ticks())
            .join('line')
            .attr('y2', height)
            .attr('stroke-width', 0.5)
            .attr('stroke', 'black')
            .attr('x1', d => x(d))
            .attr('x2', d => x(d))
            .attr('opacity', 0.2);

        gridSel.select('#horizontal')
            .selectAll('line')
            .data(y.ticks())
            .join('line')
            .attr('x2', width)
            .attr('stroke-width', 0.5)
            .attr('stroke', 'black')
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))
            .attr('opacity', 0.2);


        legendSel.selectAll('text')
            .data(conf.lines)
            .join('text')
            .attr('dominant-baseline', 'hanging')
            .attr('font-weight', 'bold')
            .attr('y', (d, idx) => idx*1.2 + 'em')
            .attr('fill', d => d.color)
            .text(d => d.label);

        const scaleFactor = zoomTransform(this.svgSel.select('#content').node()).k;
        dotsSel.selectAll('.line')
            .data(conf.lines)
            .join(enter => enter.append('g').classed('line', true))
            .attr('color', d => d.color)
            .call(sel => sel.selectAll('circle')
                .data(d => getCoordsFromLineConf(d))
                .join('circle')
                .attr('fill', 'currentColor')
                .attr('r', 2)
                .attr('cx', d => x(d.x))
                .attr('cy', d => y(d.y))
            )
            .call(sel => sel.selectAll('.label')
                .data(d => getCoordsFromLineConf(d).filter((coors, idx) => idx % 10 === 0))
                .join(enter => enter.append('text').classed('label', true))
                .attr('fill', 'currentColor')
                .attr('x', d => x(d.x))
                .attr('y', d => y(d.y))
                .attr('dx', '-0.9em')
                .attr('dy', '0.2em')
                .attr('font-size', '5px')
                .attr('text-anchor', 'end')
                .attr('transform', d => `rotate(45, ${x(d.x)}, ${y(d.y)})`)
                .attr('opacity', scaleFactor > 2 ? 1 : 0)
                .text(d => `y: ${d.y.toFixed(0)}, time: ${moment(d.x).format('YYYY/MM/DD HH:mm')}`)
            );
    }

    render() {
        return (
            <div className={this.props.className} ref={node => this.containerNode = node}>
                {this.state.width &&
                    <SVG
                        width={this.state.width + "px"}
                        height={this.props.height + "px"}
                        source={this.svgImg}
                        init={(node) => {
                            this.svgSel = select(node);
                            const dotsSel = this.svgSel.select('#dots');

                            this.svgSel.call(zoom()
                                .extent([[0, 0], [this.state.width, this.props.height]])
                                .translateExtent([[-0.5*this.state.width, -0.5*this.props.height], [1.5*this.state.width, 1.5*this.props.height]])
                                .scaleExtent([0.9, 10])
                                .on('zoom', () => {
                                    this.svgSel.select('#content')
                                        .attr("transform", event.transform);
                                    this.svgSel.selectAll('.label').attr('opacity', event.transform.k > 2 ? 1 : 0)
                                })
                            );
                        }}
                        data={{
                            dots: this.boundUpdateDots,
                        }}
                    />
                }
            </div>
        );
    }
}

const AnimatedSVGChart = animated(SVGChart);
class SVGChartSection extends Component {
    static propTypes = {
        dataSets: PropTypes.array,
    }

    getLines() {
        const lines = [];
        for (const dtSet of this.props.dataSets) {
            for (const signal of dtSet.signals) {
                lines.push({
                    color: signal.color,
                    label: signal.label,
                    dataSource: svgChartDtSourcePrefix + dtSet.cid,
                    signal: signal.cid,
                    agg: 'avg',
                });
            }
        }

        return lines;
    }

    render() {
        return (
            <AnimatedSVGChart
                config={{lines: this.getLines()}}
                height={500}
            />
        );
    }
}

@withPanelConfig
export default class Panel extends Component {
    getAnimationConfig() {
        const c = this.getPanelConfig(['animationConfig']);
        const pieChartDtSets = this.getPanelConfig(['pieChart', 'dataSets']);

        const dataSources = {};
        for (const dtSet of pieChartDtSets) {
            const signals = {};
            for (const sigCid of dtSet.sectors.map(s => s.cid)) {
                signals[sigCid] = ['avg'];
            }

            dataSources[pieChartDtSourcePrefix + dtSet.sigSetCid] = {
                type: 'generic',
                interpolation: linearInterpolation,
                withHistory: false,

                sigSetCid: dtSet.sigSetCid,
                signals,
                tsSigCid: dtSet.tsSigCid,
            };
        }


        const lineChartDtSets = this.getPanelConfig(['lineChart', 'dataSets']);
        for (const dtSet of lineChartDtSets) {
            const signals = {};
            for (const sigCid of dtSet.signals.map(s => s.cid)) {
                signals[sigCid] = ['min', 'avg', 'max'];
            }

            dataSources[lineChartDtSourcePrefix + dtSet.cid] = {
                type: 'timeSeries',
                interpolation: linearInterpolation,

                sigSetCid: dtSet.cid,
                tsSigCid: dtSet.tsSigCid,
                signals,
            };
        }

        const svgChartDtSets = this.getPanelConfig(['svgChart', 'dataSets']);
        for (const dtSet of svgChartDtSets) {
            const signals = {};
            for (const sigCid of dtSet.signals.map(s => s.cid)) {
                signals[sigCid] = ['avg'];
            }

            dataSources[svgChartDtSourcePrefix + dtSet.cid] = {
                type: 'generic',
                withHistory: true,
                interpolation: linearInterpolation,

                sigSetCid: dtSet.cid,
                tsSigCid: dtSet.tsSigCid,
                signals
            };
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
        const sectors = this.getPanelConfig(['pieChart', 'sectors']);

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
                        config={this.getPanelConfig(['lineChart'])}
                    />
                    <hr />
                    <PieChartIntroduction
                        sectors={sectors}
                        chartLabel={this.getPanelConfig(['pieChart', 'chartLabel'])}
                        chartDesc={this.getPanelConfig(['pieChart', 'chartDesc'])}
                    />
                    <PieChartsSection
                        sectors={sectors}
                        dataSets={this.getPanelConfig(['pieChart', 'dataSets'])}
                    />
                    <hr />
                    <SVGChartSection
                        dataSets={this.getPanelConfig(['svgChart', 'dataSets'])}
                    />
                </RecordedAnimation>
            </>
        );
    }
}

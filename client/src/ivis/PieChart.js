'use strict';

import React, {Component} from "react";
import {withErrorHandling} from "../lib/error-handling";
import PropTypes
    from "prop-types";
import * as d3Color
    from "d3-color";
import * as d3Shape
    from "d3-shape";
import {select} from "d3-selection";
import {StaticLegend} from "./Legend";
import styles
    from './PieChart.scss';
import {withComponentMixins} from "../lib/decorator-helpers";
import {withTranslation} from "../lib/i18n";

export const LegendPosition = {
    NONE: 0,
    RIGHT: 1,
    BOTTOM: 2
};

const legendStructure = [
    {
        labelAttr: 'label',
        colorAttr: 'color'
    }
];

@withComponentMixins([
    withTranslation,
    withErrorHandling
])
class StaticPieChart extends Component {
    static propTypes = {
        config: PropTypes.object.isRequired,
        data: PropTypes.object,
        getLabelColor: PropTypes.func,
        getArcColor: PropTypes.func,

        height: PropTypes.number.isRequired,
        margin: PropTypes.object,
        legendWidth: PropTypes.number,
        legendHeight: PropTypes.number,
        legendPosition: PropTypes.number,
        legendRowClass: PropTypes.string
    }

    static defaultProps = {
        getArcColor: color => color,
        getLabelColor: color => {
            const hsl = d3Color.hsl(color);
            if (hsl.l > 0.7) {
                return d3Color.color('black');
            } else {
                return d3Color.color('white');
            }
        },
        margin: {
            left: 5,
            right: 5,
            top: 5,
            bottom: 5
        },
        legendWidth: 120,
        legendHeight: 100,
        legendRowClass: 'col-12',
        legendPosition: LegendPosition.RIGHT
    }

    constructor(props) {
        super(props);

        this.state = {
            width: 0
        };

        this.resizeListener = ::this.updateWidth;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.prevContainerNode !== this.containerNode ||
            this.state.width !== prevState.width ||
            this.props.height !== prevProps.height ||
            this.props.margin !== prevProps.margin)
        {

            this.renderChart();
            this.prevContainerNode = this.containerNode;
        }
        else if (this.props.config !== prevProps.config ||
            this.props.data !== prevProps.data ||
            this.props.getLabelColor !== prevProps.getLabelColor ||
            this.props.getArcColor !== prevProps.getArcColor
        ) {
            this.updateChart();
            this.prevContainerNode = this.containerNode;
        }
    }

    componentDidMount() {
        this.updateWidth();
        window.addEventListener('resize', this.resizeListener);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
    }

    updateWidth() {
        this.setState({
            width: this.containerNode.getClientRects()[0].width
        });
    }

    renderChart() {
        const width = this.state.width;

        const innerWidth = width - this.props.margin.left - this.props.margin.right;
        const innerHeight = this.props.height - this.props.margin.top - this.props.margin.bottom;

        const centerX = innerWidth / 2 + this.props.margin.left;
        const centerY = innerHeight / 2 + this.props.margin.top;
        this.shadowsSelection.attr('transform', `translate(${centerX},${centerY})`);
        this.pieSelection.attr('transform', `translate(${centerX},${centerY})`);
        this.labelsSelection.attr('transform', `translate(${centerX},${centerY})`);
        this.msgSelection.attr('transform', `translate(${centerX},${centerY})`);

        const radius = Math.min(innerWidth / 2, innerHeight / 2);
        this.updateChart(radius);
    }

    updateChart(newRadius) {
        this.chartRadius = newRadius || this.chartRadius;

        const getRawValue = (value) => {
            if (typeof value === "number") return value;
            else {
                let resValue = null;
                if (this.props.data && value.sigSetCid && value.signalCid && value.agg) {
                    resValue = this.props.data[value.sigSetCid][value.signalCid][value.agg];
                }

                return resValue;
            }
        };

        const valueAccessor = (entry) => {
            const rawValue = getRawValue(entry.value);
            return typeof rawValue === "number" ? rawValue : 0;
        };

        let total = 0;
        for (const entry of this.props.config.arcs) {
            total += valueAccessor(entry);
        }

        if (total === 0) {
            this.msgSelection.text('No data.');
        } else {
            this.msgSelection.text(null);
        }

        const pieGen = d3Shape.pie()
            .padAngle(0.02)
            .sort(null)
            .value(valueAccessor);

        const arcGen = d3Shape.arc()
            .outerRadius(this.chartRadius)
            .innerRadius(this.chartRadius - 60);

        const shadows = this.shadowsSelection.selectAll('path').data(pieGen(this.props.config.arcs));
        shadows.enter().append('path')
            .merge(shadows)
            .attr('d', arcGen)
            .attr('filter', 'url(#shadow)')
            .attr('fill', 'rgba(0,0,0, 0.3)');

        const arcs = this.pieSelection.selectAll('path').data(pieGen(this.props.config.arcs));
        arcs.enter().append('path')
            .merge(arcs)
            .attr('d', arcGen)
            .attr('fill', d => this.props.getArcColor(d.data.color));

        const labels = this.labelsSelection.selectAll('text').data(pieGen(this.props.config.arcs));
        labels.enter().append('text')
            .merge(labels)
            .attr('transform', d => `translate(${arcGen.centroid(d)})`)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('class', styles.label)
            .attr('fill', d => this.props.getLabelColor(d.data.color))
            .text(d => {
                const ratio = Math.floor(d.value * 100 / total);
                return ratio > 5 ? `${ratio}%` : '';
            });
    }

    render() {
        return (
            <div>
                <svg className={styles.pie} ref={node => this.containerNode = node} height={this.props.height} width="100%">
                    <defs>
                        <filter id="shadow">
                            <feOffset result="offOut" in="SourceGraphic" dx="2" dy="2" />
                            <feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" />
                        </filter>
                    </defs>
                    <text ref={node => this.msgSelection = select(node)} fill="black" textAnchor="middle"/>
                    <g ref={node => this.shadowsSelection = select(node)} />
                    <g ref={node => this.pieSelection = select(node)} />
                    <g ref={node => this.labelsSelection = select(node)} />

                    {this.props.legendPosition === LegendPosition.RIGHT &&
                    <g>
                        <foreignObject requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" width={this.props.legendWidth} height={this.props.legendHeight} x={this.state.width - this.props.margin.right - this.props.legendWidth} y={this.props.margin.top}>
                            <StaticLegend config={this.props.config.arcs} structure={legendStructure} className={`${styles.legend} ${styles.legendRight}`} rowClassName={this.props.legendRowClass}/>
                        </foreignObject>
                    </g>
                    }
                </svg>
                {this.props.legendPosition === LegendPosition.BOTTOM &&
                    <StaticLegend config={this.props.config.arcs} structure={legendStructure} className={`${styles.legend} ${styles.legendBottom}`} rowClassName={this.props.legendRowClass}/>
                }
            </div>
        );
    }
}

export {
    StaticPieChart,
};

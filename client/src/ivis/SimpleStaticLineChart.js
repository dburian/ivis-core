import PropTypes from "prop-types";
import React, {Component} from "react";
import {area, line} from "d3-shape";
import {axisBottom, axisLeft} from "d3-axis";
import {select} from "d3-selection";
import styles from "./SimpleStaticLineChart.scss";


export class StaticLineChart extends Component {
    static propTypes = {
        data: PropTypes.object,

        codomainLabel: PropTypes.string,
        domainLabel: PropTypes.string,

        withArea: PropTypes.bool,
        withTickLines: PropTypes.bool,

        strokeColor: PropTypes.object,
        strokeWidth: PropTypes.number,
        areaColor: PropTypes.object,

        yScale: PropTypes.func.isRequired,
        xScale: PropTypes.func.isRequired,

        padding: PropTypes.object,
        classNames: PropTypes.object,
    };

    static defaultProps = {
        classNames: {},
        padding: {
            left: 40,
            right: 20,
            top: 20,
            bottom: 40,
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            width: 0,
            height: 0,
        };

        this.resizeListener = ::this.updateBoundingRect;
        this.nodeRefs = {};
    }

    componentDidUpdate() {
        this.renderChart();
    }

    componentDidMount() {
        this.resizeListener();
        window.addEventListener('resize', this.resizeListener);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeListener);
    }

    updateBoundingRect() {
        const rect = this.nodeRefs.container.getClientRects()[0];
        this.setState({
            width: rect.width,
            height: rect.height,
        });
    }

    renderChart() {
        const x = this.props.xScale;
        const y = this.props.yScale;

        const width = this.state.width - this.props.padding.left - this.props.padding.right;
        const height = this.state.height - this.props.padding.top - this.props.padding.bottom;

        select(this.nodeRefs.bottomAxis)
            .call(axisBottom(x.range([0, width])))
            .call(sel => sel.selectAll(".tickLine").remove())
            .selectAll(".tick line").clone().classed("tickLine", true)
            .attr("y2", -y.range()[1])
            .attr("stroke-opacity", this.props.withTickLines ? 0.1 : 0);

        select(this.nodeRefs.leftAxis)
            .call(axisLeft(y.range([height, 0])))
            .call(sel => sel.selectAll(".tickLine").remove())
            .selectAll(".tick line").clone().classed("tickLine", true)
            .attr("x2", x.range()[1])
            .attr("stroke-opacity", this.props.withTickLines ? 0.1 : 0);

        const chartGen = this.props.withArea ? area.y0(y.domain()[0]) : line;

        select(this.nodeRefs.line)
            .datum(this.props.data)
            .attr("stroke-width", this.props.strokeWidth)
            .attr("stroke", this.props.strokeColor)
            .attr("fill", this.props.areaColor || "none")
            .attr("d", chartGen()
                .x(d => x(d.x))
                .y(d => y(d.y))
            );
    }

    render() {
        return (
            <>
                <svg className={styles.staticLineChart + " " + (this.props.classNames.container || "")}
                    ref={node => this.nodeRefs.container = node} xmlns={"http://www.w3.org/2000/svg"}>

                    <g ref={node => this.nodeRefs.content = node}
                        transform={`translate(${this.props.padding.left}, ${this.props.padding.top})`}>

                        <g ref={node => this.nodeRefs.leftAxis = node}>
                            <text className={styles.y_axisLabel} dx={"0.3em"}>
                                {this.props.codomainLabel}
                            </text>
                        </g>
                        <g ref={node => this.nodeRefs.bottomAxis = node} transform={`translate(0,${this.state.height})`}>
                            <text className={styles.x_axisLabel} dy={"-0.3em"} x={this.state.width}>
                                {this.props.domainLabel}
                            </text>
                        </g>

                        <path ref={node => this.nodeRefs.line = node} />
                    </g>
                </svg>
            </>
        );
    }
}

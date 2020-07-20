"use strict";

exports.seed = (knex, Promise) => (async() => {

    const settings_1 = {
      "params": [
        {
          "id": "animationConfig",
          "label": "Animation configuration",
          "type": "fieldset",
          "cardinality": "1..1",
          "children": [
            {
              "id": "refreshRate",
              "label": "Animation refresh rate in ms",
              "type": "number"
            },
            {
              "id": "initialStatus",
              "label": "Initial state of animation",
              "type": "fieldset",
              "cardinality": "0..1",
              "children": [
                {
                  "id": "isPlaying",
                  "label": "Playing on load",
                  "type": "boolean"
                },
                {
                  "id": "positionISO",
                  "label": "Position on load in ISO 8601 format",
                  "type": "string"
                },
                {
                  "id": "playbackSpeedFactor",
                  "label": "Playback speed factor on load",
                  "type": "number"
                }
              ]
            },
            {
              "id": "controls",
              "label": "Controls configuration",
              "type": "fieldset",
              "cardinality": "1..1",
              "children": [
                {
                  "id": "playPause",
                  "label": "Play/Pause button",
                  "type": "fieldset",
                  "cardinality": "1..1",
                  "children": [
                    {
                      "id": "visible",
                      "label": "Is visible?",
                      "type": "boolean"
                    },
                    {
                      "id": "enabled",
                      "label": "Is enabled?",
                      "type": "boolean"
                    }
                  ]
                },
                {
                  "id": "stop",
                  "label": "Stop button",
                  "type": "fieldset",
                  "cardinality": "1..1",
                  "children": [
                    {
                      "id": "visible",
                      "label": "Is visible?",
                      "type": "boolean"
                    },
                    {
                      "id": "enabled",
                      "label": "Is enabled?",
                      "type": "boolean"
                    }
                  ]
                },
                {
                  "id": "jumpForward",
                  "label": "Jump forward button",
                  "type": "fieldset",
                  "cardinality": "1..1",
                  "children": [
                    {
                      "id": "visible",
                      "label": "Is visible?",
                      "type": "boolean"
                    },
                    {
                      "id": "enabled",
                      "label": "Is enabled?",
                      "type": "boolean"
                    },
                    {
                      "id": "jumpFactor",
                      "label": "Jump factor of played interval",
                      "type": "number"
                    }
                  ]
                },
                {
                  "id": "jumpBackward",
                  "label": "Jump backward button",
                  "type": "fieldset",
                  "cardinality": "1..1",
                  "children": [
                    {
                      "id": "visible",
                      "label": "Is visible?",
                      "type": "boolean"
                    },
                    {
                      "id": "enabled",
                      "label": "Is enabled?",
                      "type": "boolean"
                    },
                    {
                      "id": "jumpFactor",
                      "label": "Jump factor of played interval",
                      "type": "number"
                    }
                  ]
                },
                {
                  "id": "changeSpeed",
                  "label": "Change speed button",
                  "type": "fieldset",
                  "cardinality": "1..1",
                  "children": [
                    {
                      "id": "visible",
                      "label": "Is visible?",
                      "type": "boolean"
                    },
                    {
                      "id": "enabled",
                      "label": "Is enabled?",
                      "type": "boolean"
                    },
                    {
                      "id": "steps",
                      "label": "Possible speed factors",
                      "type": "fieldset",
                      "cardinality": "0..n",
                      "children": [
                        {
                          "id": "step",
                          "label": "Speed factor",
                          "type": "number"
                        }
                      ]
                    }
                  ]
                },
                {
                  "id": "timeline",
                  "label": "Timeline",
                  "type": "fieldset",
                  "cardinality": "1..1",
                  "children": [
                    {
                      "id": "visible",
                      "label": "Is visible?",
                      "type": "boolean"
                    },
                    {
                      "id": "enabled",
                      "label": "Is enabled?",
                      "type": "boolean"
                    },
                    {
                      "id": "positionFormatString",
                      "label": "Label format of current time and date",
                      "help": "Possible format tokens can be found at https://momentjs.com/docs/#/displaying/format/",
                      "type": "string"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "pageHeader",
          "label": "Page header",
          "type": "string"
        },
        {
          "id": "pageDesc",
          "label": "Page description",
          "type": "text"
        },
        {
          "id": "linechart",
          "label": "Line chart configuration",
          "type": "fieldset",
          "cardinality": "1..1",
          "children": [
            {
              "id": "dataSets",
              "label": "Signal sets",
              "type": "fieldset",
              "cardinality": "1..n",
              "children": [
                {
                  "id": "cid",
                  "label": "Signal Set",
                  "type": "signalSet"
                },
                {
                  "id": "tsSigCid",
                  "label": "Timestamp signal",
                  "type": "signal",
                  "signalSetRef": "cid"
                },
                {
                  "id": "signals",
                  "label": "Signals",
                  "type": "fieldset",
                  "cardinality": "1..n",
                  "children": [
                    {
                      "id": "label",
                      "label": "Label",
                      "type": "string"
                    },
                    {
                      "id": "color",
                      "label": "Color",
                      "type": "color"
                    },
                    {
                      "id": "cid",
                      "label": "Signal",
                      "type": "signal",
                      "signalSetRef": "../../cid"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": "barchart",
          "label": "Bar chart configuration",
          "type": "fieldset",
          "cardinality": "1..1",
          "children": [
            {
              "id": "chartLabel",
              "label": "Chart label",
              "type": "string"
            },
            {
              "id": "domainLabel",
              "label": "Domain label",
              "type": "string"
            },
            {
              "id": "codomainLabel",
              "label": "Codomain label",
              "type": "string"
            },
            {
              "id": "valueFormatSpecifier",
              "label": "Codomain value specifier",
              "type": "string"
            },
            {
              "id": "chartDesc",
              "label": "Chart description",
              "type": "text"
            },
            {
              "id": "categories",
              "label": "Categories",
              "type": "fieldset",
              "cardinality": "1..n",
              "children": [
                {
                  "id": "id",
                  "label": "Category identifier",
                  "type": "string"
                },
                {
                  "id": "label",
                  "label": "Category label",
                  "type": "string"
                },
                {
                  "id": "desc",
                  "label": "Category description",
                  "type": "text"
                },
                {
                  "id": "color",
                  "label": "Category color",
                  "type": "color"
                }
              ]
            },
            {
              "id": "dataSets",
              "label": "Bar chart contexts",
              "type": "fieldset",
              "cardinality": "1..n",
              "children": [
                {
                  "id": "name",
                  "label": "Context name",
                  "type": "string"
                },
                {
                  "id": "sigSetCid",
                  "help": "Must be unique among all signal sets inside all bar chart contexts.",
                  "label": "Signal set",
                  "type": "signalSet"
                },
                {
                  "id": "tsSigCid",
                  "label": "Timestamp signal",
                  "type": "signal",
                  "signalSetRef": "sigSetCid"
                },
                {
                  "id": "categories",
                  "label": "Categories in this context",
                  "type": "fieldset",
                  "cardinality": "1..n",
                  "children": [
                    {
                      "id": "categoryId",
                      "label": "Category identifier",
                      "type": "string"
                    },
                    {
                      "id": "cid",
                      "label": "Signal",
                      "type": "signal",
                      "signalSetRef": "../../sigSetCid"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "jsx":
            "'use strict';\n" +
            "\n" +
            "import React, {Component} from 'react';\n" +
            "import moment from 'moment';\n" +
            "import {\n" +
                "RecordedAnimation,\n" +
                "OnelineLayout,\n" +
                "animated,\n" +
                "LineChart,\n" +
                "SimpleBarChart,\n" +
                "StaticLegend,\n" +
                "withPanelConfig,\n" +
                "linearInterpolation,\n" +
                "cubicInterpolation,\n" +
                "expensiveCubicInterpolation,\n" +
                "TimeRangeSelector,\n" +
            "} from 'ivis';\n" +
            "import PropTypes from 'prop-types';\n" +
            "import styles from './styles.scss';\n" +
            "\n" +
            "const lineChartDtSourcePrefix = 'linechart_';\n" +
            "const barChartDtSourcePrefix = 'barchart_';\n" +
            "\n" +
            "class PanelIntroduction extends Component {\n" +
            "static propTypes = {\n" +
            "header: PropTypes.string,\n" +
            "desc: PropTypes.string,\n" +
            "}\n" +
            "\n" +
            "render() {\n" +
            "\n" +
            "return (\n" +
            "<>\n" +
            "<div className=\"jumbotron rounded-lg mb-5 p-4\">\n" +
            "<h1 className=\"display-4 mb-5\">\n" +
            "{this.props.header}\n" +
            "</h1>\n" +
            "<p className=\"text-justify lead\">\n" +
            "{this.props.desc}\n" +
            "</p>\n" +
            "</div>\n" +
            "<hr />\n" +
            "</>\n" +
            ");\n" +
            "}\n" +
            "}\n" +
            "\n" +
            "class BarChartIntroduction extends Component {\n" +
            "static propTypes = {\n" +
            "categories: PropTypes.array.isRequired,\n" +
            "chartDesc: PropTypes.string.isRequired,\n" +
            "chartLabel: PropTypes.string.isRequired,\n" +
            "}\n" +
            "\n" +
            "render() {\n" +
            "const renderCategory = (category) => {\n" +
            "return (\n" +
            "<div key={category.id} className=\"callout\" style={{borderColor: category.color}}>\n" +
            "<h5>{category.label}</h5>\n" +
            "<p className=\"text-justify\">{category.desc}</p>\n" +
            "</div>\n" +
            ");\n" +
            "};\n" +
            "\n" +
            "return (\n" +
            "<div className=\"mb-5 p-4\">\n" +
            "<h2 className=\"text-center mb-5\">{this.props.chartLabel}</h2>\n" +
            "<p className=\"text-justify mb-2\">\n" +
            "{this.props.chartDesc}\n" +
            "</p>\n" +
            "<h5>Bar categories:</h5>\n" +
            "{this.props.categories.map(renderCategory)}\n" +
            "</div>\n" +
            ");\n" +
            "}\n" +
            "}\n" +
            "\n" +
            "const AnimatedBarChart = animated(SimpleBarChart);\n" +
            "class BarChartSection extends Component {\n" +
            "static propTypes = {\n" +
            "categories: PropTypes.array,\n" +
            "dataSets: PropTypes.array,\n" +
            "\n" +
            "domainLabel: PropTypes.string,\n" +
            "codomainLabel: PropTypes.string,\n" +
            "\n" +
            "valueFormatSpecifier: PropTypes.string,\n" +
            "}\n" +
            "\n" +
            "getBarChartConfig() {\n" +
            "const config = {\n" +
            "groups: [],\n" +
            "};\n" +
            "\n" +
            "const colors = {};\n" +
            "for (const cat of this.props.categories) {\n" +
            "colors[cat.id] = cat.color;\n" +
            "}\n" +
            "\n" +
            "for (const dataSet of this.props.dataSets) {\n" +
            "const group = {\n" +
            "label: dataSet.name,\n" +
            "colors: dataSet.categories.map(c => colors[c.categoryId]),\n" +
            "values: dataSet.categories.map(c => ({\n" +
            "dataSource: barChartDtSourcePrefix + dataSet.sigSetCid,\n" +
            "signal: c.cid,\n" +
            "agg: 'avg'\n" +
            "})),\n" +
            "};\n" +
            "\n" +
            "config.groups.push(group);\n" +
            "}\n" +
            "\n" +
            "return config;\n" +
            "}\n" +
            "\n" +
            "render() {\n" +
            "const structure = [\n" +
            "{\n" +
            "labelAttr: 'label',\n" +
            "colorAttr: 'color',\n" +
            "},\n" +
            "];\n" +
            "const isHorizontal = this.props.dataSets.length > 4;\n" +
            "const height = isHorizontal ?\n" +
            "this.props.dataSets.length * this.props.categories.length * 35 :\n" +
            "600\n" +
            ";\n" +
            "\n" +
            "return (\n" +
            "<div className=\"px-1 text-center\">\n" +
            "<AnimatedBarChart\n" +
            "height={height}\n" +
            "padding={{\n" +
            "bottom: 30,\n" +
            "top: 10,\n" +
            "left: 100,\n" +
            "right: 70,\n" +
            "}}\n" +
            "isHorizontal={isHorizontal}\n" +
            "domainLabel={this.props.domainLabel}\n" +
            "codomainLabel={this.props.codomainLabel}\n" +
            "config={this.getBarChartConfig()}\n" +
            "\n" +
            "withTickLines\n" +
            "withBarValues\n" +
            "\n" +
            "valueFormatSpecifier={this.props.valueFormatSpecifier}\n" +
            "/>\n" +
            "\n" +
            "<StaticLegend\n" +
            "structure={structure}\n" +
            "config={this.props.categories}\n" +
            "rowClassName={\"col \" + styles.legendRow}\n" +
            "/>\n" +
            "</div>\n" +
            ");\n" +
            "}\n" +
            "}\n" +
            "\n" +
            "const AnimatedLineChart = animated(LineChart);\n" +
            "class LineChartSection extends Component {\n" +
            "static propTypes = {\n" +
            "config: PropTypes.object.isRequired,\n" +
            "}\n" +
            "\n" +
            "render() {\n" +
            "const config = {\n" +
            "yAxes: [{visible: true, belowMin: 0.1, aboveMax: 0.2}],\n" +
            "signalSets: this.props.config.dataSets,\n" +
            "};\n" +
            "\n" +
            "return (\n" +
            "<div className=\"container-fluid\">\n" +
            "<AnimatedLineChart\n" +
            "config={config}\n" +
            "height={500}\n" +
            "withTooltip\n" +
            "animationDataFormatter={data => {\n" +
            "const dtSrces = Object.keys(data)\n" +
            ".filter(dtSrcKey => dtSrcKey.startsWith(lineChartDtSourcePrefix))\n" +
            ".map(dtSrcKey => data[dtSrcKey]);\n" +
            "\n" +
            "return [Object.assign({}, ...dtSrces)];\n" +
            "}}\n" +
            "/>\n" +
            "</div>\n" +
            ");\n" +
            "}\n" +
            "}\n" +
            "\n" +
            "@withPanelConfig\n" +
            "export default class Panel extends Component {\n" +
            "getAnimationConfig() {\n" +
            "const c = this.getPanelConfig(['animationConfig']);\n" +
            "const barChartDtSets = this.getPanelConfig(['barchart', 'dataSets']);\n" +
            "\n" +
            "const dataSources = {};\n" +
            "for (const dtSet of barChartDtSets) {\n" +
            "const signals = {};\n" +
            "for (const sigCid of dtSet.categories.map(c => c.cid)) {\n" +
            "signals[sigCid] = ['avg'];\n" +
            "}\n" +
            "\n" +
            "dataSources[barChartDtSourcePrefix + dtSet.sigSetCid] = {\n" +
            "type: 'generic',\n" +
            "interpolation: expensiveCubicInterpolation,\n" +
            "withHistory: false,\n" +
            "\n" +
            "sigSetCid: dtSet.sigSetCid,\n" +
            "signals,\n" +
            "tsSigCid: dtSet.tsSigCid,\n" +
            "};\n" +
            "}\n" +
            "\n" +
            "\n" +
            "const lineChartDtSets = this.getPanelConfig(['linechart', 'dataSets']);\n" +
            "for (const dtSet of lineChartDtSets) {\n" +
            "const signals = {};\n" +
            "for (const sigCid of dtSet.signals.map(s => s.cid)) {\n" +
            "signals[sigCid] = ['min', 'max', 'avg'];\n" +
            "}\n" +
            "\n" +
            "dataSources[lineChartDtSourcePrefix + dtSet.cid] = {\n" +
            "type: 'timeSeries',\n" +
            "interpolation: cubicInterpolation,\n" +
            "\n" +
            "sigSetCid: dtSet.cid,\n" +
            "tsSigCid: dtSet.tsSigCid,\n" +
            "signals,\n" +
            "}\n" +
            "}\n" +
            "\n" +
            "\n" +
            "return {\n" +
            "refreshRate: c.refreshRate,\n" +
            "initialStatus: c.initialStatus && {\n" +
            "isPlaying: !!c.initialStatus.isPlaying,\n" +
            "position: c.initialStatus.positionISO && moment.utc(c.initialStatus.positionISO).valueOf(),\n" +
            "playbackSpeedFactor: c.initialStatus.playbackSpeedFactor,\n" +
            "},\n" +
            "dataSources\n" +
            "};\n" +
            "}\n" +
            "\n" +
            "getControlsConfig() {\n" +
            "const config = this.getPanelConfig(['animationConfig', 'controls']);\n" +
            "\n" +
            "if (config.timeline.positionFormatString.length === 0) {\n" +
            "config.timeline.positionFormatString = undefined;\n" +
            "}\n" +
            "\n" +
            "const changeSpeedSteps = config.changeSpeed.steps;\n" +
            "if (changeSpeedSteps.length === 0) {\n" +
            "config.changeSpeed.steps = undefined;\n" +
            "} else {\n" +
            "config.changeSpeed.steps = changeSpeedSteps.map(step => step.step);\n" +
            "}\n" +
            "\n" +
            "if (Number.isNaN(config.jumpForward.jumpFactor))\n" +
            "config.jumpForward.jumpFactor = undefined;\n" +
            "if (Number.isNaN(config.jumpBackward.jumpFactor))\n" +
            "config.jumpBackward.jumpFactor = undefined;\n" +
            "\n" +
            "return config\n" +
            "}\n" +
            "\n" +
            "render() {\n" +
            "const categories = this.getPanelConfig(['barchart', 'categories']);\n" +
            "\n" +
            "return (\n" +
            "<>\n" +
            "<PanelIntroduction\n" +
            "header={this.getPanelConfig(['pageHeader'])}\n" +
            "desc={this.getPanelConfig(['pageDesc'])}\n" +
            "/>\n" +
            "\n" +
            "<RecordedAnimation {...this.getAnimationConfig()}>\n" +
            "<TimeRangeSelector />\n" +
            "<OnelineLayout {...this.getControlsConfig()} />\n" +
            "<LineChartSection\n" +
            "config={this.getPanelConfig(['linechart'])}\n" +
            "/>\n" +
            "<hr />\n" +
            "<BarChartIntroduction\n" +
            "categories={categories}\n" +
            "chartLabel={this.getPanelConfig(['barchart', 'chartLabel'])}\n" +
            "chartDesc={this.getPanelConfig(['barchart', 'chartDesc'])}\n" +
            "/>\n" +
            "<BarChartSection\n" +
            "domainLabel={this.getPanelConfig(['barchart', 'domainLabel'])}\n" +
            "codomainLabel={this.getPanelConfig(['barchart', 'codomainLabel'])}\n" +
            "valueFormatSpecifier={this.getPanelConfig(['barchart', 'valueFormatSpecifier'])}\n" +
            "categories={categories}\n" +
            "dataSets={this.getPanelConfig(['barchart', 'dataSets'])}\n" +
            "/>\n" +
            "</RecordedAnimation>\n" +
            "</>\n" +
            ");\n" +
            "}\n" +
            "}\n",
          "scss":
                ".legendRow {\n" +
                "font-weight: normal;\n" +
                "}\n" +
                "\n" +
                ".svgSection {\n" +
                "width: 100%;\n" +
                "height: 500px;\n" +
                "}",
        };

    const settings_2 = {
    "params": [
        {
            "id": "animationConfig",
            "label": "Animation configuration",
            "type": "fieldset",
            "cardinality": "1..1",
            "children": [
                {
                    "id": "refreshRate",
                    "label": "Animation refresh rate in ms",
                    "type": "number"
                },
                {
                    "id": "initialStatus",
                    "label": "Initial state of animation",
                    "type": "fieldset",
                    "cardinality": "0..1",
                    "children": [
                        {
                            "id": "isPlaying",
                            "label": "Playing on load",
                            "type": "boolean"
                        },
                        {
                            "id": "positionISO",
                            "label": "Position on load in ISO 8601 format",
                            "type": "string"
                        },
                        {
                            "id": "playbackSpeedFactor",
                            "label": "Playback speed factor on load",
                            "type": "number"
                        }
                    ]
                },
                {
                    "id": "controls",
                    "label": "Controls configuration",
                    "type": "fieldset",
                    "cardinality": "1..1",
                    "children": [
                        {
                            "id": "playPause",
                            "label": "Play/Pause button",
                            "type": "fieldset",
                            "cardinality": "1..1",
                            "children": [
                                {
                                    "id": "visible",
                                    "label": "Is visible?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "enabled",
                                    "label": "Is enabled?",
                                    "type": "boolean"
                                }
                            ]
                        },
                        {
                            "id": "stop",
                            "label": "Stop button",
                            "type": "fieldset",
                            "cardinality": "1..1",
                            "children": [
                                {
                                    "id": "visible",
                                    "label": "Is visible?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "enabled",
                                    "label": "Is enabled?",
                                    "type": "boolean"
                                }
                            ]
                        },
                        {
                            "id": "jumpForward",
                            "label": "Jump forward button",
                            "type": "fieldset",
                            "cardinality": "1..1",
                            "children": [
                                {
                                    "id": "visible",
                                    "label": "Is visible?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "enabled",
                                    "label": "Is enabled?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "jumpFactor",
                                    "label": "Jump factor of played interval",
                                    "type": "number"
                                }
                            ]
                        },
                        {
                            "id": "jumpBackward",
                            "label": "Jump backward button",
                            "type": "fieldset",
                            "cardinality": "1..1",
                            "children": [
                                {
                                    "id": "visible",
                                    "label": "Is visible?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "enabled",
                                    "label": "Is enabled?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "jumpFactor",
                                    "label": "Jump factor of played interval",
                                    "type": "number"
                                }
                            ]
                        },
                        {
                            "id": "changeSpeed",
                            "label": "Change speed button",
                            "type": "fieldset",
                            "cardinality": "1..1",
                            "children": [
                                {
                                    "id": "visible",
                                    "label": "Is visible?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "enabled",
                                    "label": "Is enabled?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "steps",
                                    "label": "Possible speed factors",
                                    "type": "fieldset",
                                    "cardinality": "0..n",
                                    "children": [
                                        {
                                            "id": "step",
                                            "label": "Speed factor",
                                            "type": "number"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "id": "timeline",
                            "label": "Timeline",
                            "type": "fieldset",
                            "cardinality": "1..1",
                            "children": [
                                {
                                    "id": "visible",
                                    "label": "Is visible?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "enabled",
                                    "label": "Is enabled?",
                                    "type": "boolean"
                                },
                                {
                                    "id": "positionFormatString",
                                    "label": "Label format of current time and date",
                                    "help": "Possible format tokens can be found at https://momentjs.com/docs/#/displaying/format/",
                                    "type": "string"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "id": "pageHeader",
            "label": "Page header",
            "type": "string"
        },
        {
            "id": "pageDesc",
            "label": "Page description",
            "type": "text"
        },
        {
            "id": "lineChart",
            "label": "Configuration of line chart",
            "type": "fieldset",
            "cardinality": "1..1",
            "children": [
                {
                    "id": "dataSets",
                    "label": "Signal sets",
                    "type": "fieldset",
                    "cardinality": "1..n",
                    "children": [
                        {
                            "id": "cid",
                            "label": "Signal Set",
                            "type": "signalSet"
                        },
                        {
                            "id": "tsSigCid",
                            "label": "Timestamp signal",
                            "type": "signal",
                            "signalSetRef": "cid"
                        },
                        {
                            "id": "signals",
                            "label": "Signals",
                            "type": "fieldset",
                            "cardinality": "1..n",
                            "children": [
                                {
                                    "id": "label",
                                    "label": "Label",
                                    "type": "string"
                                },
                                {
                                    "id": "color",
                                    "label": "Color",
                                    "type": "color"
                                },
                                {
                                    "id": "cid",
                                    "label": "Signal",
                                    "type": "signal",
                                    "signalSetRef": "../../cid"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "id": "pieChart",
            "label": "Configuration of pie charts",
            "type": "fieldset",
            "cardinality": "1..1",
            "children": [
                {
                    "id": "chartLabel",
                    "label": "Pie chart label",
                    "type": "string"
                },
                {
                    "id": "chartDesc",
                    "label": "Pie chart description",
                    "type": "text"
                },
                {
                    "id": "sectors",
                    "label": "Pie chart sectors",
                    "type": "fieldset",
                    "cardinality": "1..n",
                    "children": [
                        {
                            "id": "id",
                            "label": "Sector identifier",
                            "type": "string"
                        },
                        {
                            "id": "label",
                            "label": "Sector label",
                            "type": "string"
                        },
                        {
                            "id": "desc",
                            "label": "Sector description",
                            "type": "text"
                        },
                        {
                            "id": "color",
                            "label": "Sector color",
                            "type": "color"
                        }
                    ]
                },
                {
                    "id": "dataSets",
                    "label": "Pie chart contexts",
                    "type": "fieldset",
                    "cardinality": "1..n",
                    "children": [
                        {
                            "id": "name",
                            "label": "Context name",
                            "type": "string"
                        },
                        {
                            "id": "sigSetCid",
                            "help": "Must be unique among all signal sets inside all pie chart contexts",
                            "label": "Signal set",
                            "type": "signalSet"
                        },
                        {
                            "id": "tsSigCid",
                            "label": "Timestamp signal",
                            "type": "signal",
                            "signalSetRef": "sigSetCid"
                        },
                        {
                            "id": "sectors",
                            "label": "Sectors",
                            "type": "fieldset",
                            "cardinality": "1..n",
                            "children": [
                                {
                                    "id": "cid",
                                    "label": "Signal for sector",
                                    "type": "signal",
                                    "signalSetRef": "../../sigSetCid"
                                },
                                {
                                    "id": "sectorId",
                                    "label": "Sector identifier",
                                    "type": "string"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "id": "svgChart",
            "label": "Configuration of SVG chart",
            "type": "fieldset",
            "cardinality": "1..1",
            "children": [
                {
                    "id": "dataSets",
                    "label": "Signal sets",
                    "type": "fieldset",
                    "cardinality": "1..n",
                    "children": [
                        {
                            "id": "cid",
                            "label": "Signal Set",
                            "type": "signalSet"
                        },
                        {
                            "id": "tsSigCid",
                            "label": "Timestamp signal",
                            "type": "signal",
                            "signalSetRef": "cid"
                        },
                        {
                            "id": "signals",
                            "label": "Signals",
                            "type": "fieldset",
                            "cardinality": "1..n",
                            "children": [
                                {
                                    "id": "label",
                                    "label": "Label",
                                    "type": "string"
                                },
                                {
                                    "id": "color",
                                    "label": "Color",
                                    "type": "color"
                                },
                                {
                                    "id": "cid",
                                    "label": "Signal",
                                    "type": "signal",
                                    "signalSetRef": "../../cid"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "jsx": "'use strict';\n" +
        "\n" +
        "import React, {Component} from 'react';\n" +
        "import moment from 'moment';\n" +
        "import {select, event} from 'd3-selection';\n" +
        "import {scaleTime, scaleLinear} from 'd3-scale';\n" +
        "import {zoom, zoomTransform} from 'd3-zoom';\n" +
        "import {extent} from 'd3-array';\n" +
        "import {\n" +
        "RecordedAnimation,\n" +
        "OnelineLayout,\n" +
        "animated,\n" +
        "LineChart,\n" +
        "StaticPieChart,\n" +
        "LegendPosition,\n" +
        "withPanelConfig,\n" +
        "linearInterpolation,\n" +
        "cubicInterpolation,\n" +
        "expensiveCubicInterpolation,\n" +
        "TimeRangeSelector,\n" +
        "SVG,\n" +
    "} from 'ivis';\n" +
        "import PropTypes from 'prop-types';\n" +
        "import styles from './styles.scss';\n" +
        "\n" +
        "const pieChartDtSourcePrefix = 'piechart_';\n" +
        "const lineChartDtSourcePrefix = 'lineChart_';\n" +
        "const svgChartDtSourcePrefix = 'svgChart_';\n" +
        "\n" +
        "class PanelIntroduction extends Component {\n" +
        "static propTypes = {\n" +
        "header: PropTypes.string,\n" +
        "desc: PropTypes.string,\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "\n" +
        "return (\n" +
        "<>\n" +
        "<div className=\"jumbotron rounded-lg mb-5 p-4\">\n" +
        "<h1 className=\"display-4 mb-5\">\n" +
        "{this.props.header}\n" +
        "</h1>\n" +
        "<p className=\"text-justify lead\">\n" +
        "{this.props.desc}\n" +
        "</p>\n" +
        "</div>\n" +
        "<hr />\n" +
        "</>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "const AnimatedLineChart = animated(LineChart);\n" +
        "class LineChartSection extends Component {\n" +
        "static propTypes = {\n" +
        "config: PropTypes.object.isRequired,\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "const config = {\n" +
        "yAxes: [{visible: true, belowMin: 0.1, aboveMax: 0.2}],\n" +
        "signalSets: this.props.config.dataSets\n" +
    "};\n" +
        "\n" +
        "\n" +
        "return (\n" +
        "<div className=\"container-fluid\">\n" +
        "<AnimatedLineChart\n" +
        "config={config}\n" +
        "height={500}\n" +
        "withTooltip\n" +
        "animationDataFormatter={data => {\n" +
        "const dtSrces = Object.keys(data)\n" +
        ".filter(dtSrcKey => dtSrcKey.startsWith(lineChartDtSourcePrefix))\n" +
        ".map(dtSrcKey => data[dtSrcKey]);\n" +
        "\n" +
        "return [Object.assign({}, ...dtSrces)];\n" +
    "}}\n" +
        "/>\n" +
        "</div>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "class PieChartIntroduction extends Component {\n" +
        "static propTypes = {\n" +
        "sectors: PropTypes.array.isRequired,\n" +
        "chartDesc: PropTypes.string.isRequired,\n" +
        "chartLabel: PropTypes.string.isRequired,\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "const renderSector = (sector) => {\n" +
        "return (\n" +
        "<div key={sector.id} className=\"callout\" style={{borderColor: sector.color}}>\n" +
        "<h5>{sector.label}</h5>\n" +
        "<p className=\"text-justify\">{sector.desc}</p>\n" +
        "</div>\n" +
    ");\n" +
    "};\n" +
        "\n" +
        "return (\n" +
        "<div className=\"mb-5 p-4\">\n" +
        "<h2 className=\"text-center mb-5\">{this.props.chartLabel}</h2>\n" +
        "<p className=\"text-justify mb-2\">\n" +
        "{this.props.chartDesc}\n" +
        "</p>\n" +
        "<h5>Pie chart sectors:</h5>\n" +
        "{this.props.sectors.map(renderSector)}\n" +
        "</div>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "class PieChartsSection extends Component {\n" +
        "static propTypes = {\n" +
        "sectors: PropTypes.array.isRequired,\n" +
        "dataSets: PropTypes.array.isRequired,\n" +
    "}\n" +
        "\n" +
        "getPieChartsProps() {\n" +
        "const colors = {};\n" +
        "const labels = {};\n" +
        "for (const secConf of this.props.sectors) {\n" +
        "colors[secConf.id] = secConf.color;\n" +
        "labels[secConf.id] = secConf.label;\n" +
    "}\n" +
        "\n" +
        "const pieChartProps = [];\n" +
        "for (const dtSet of this.props.dataSets) {\n" +
        "const arcs = [];\n" +
        "for(const sector of dtSet.sectors) {\n" +
        "arcs.push({\n" +
        "color: colors[sector.sectorId],\n" +
        "label: labels[sector.sectorId],\n" +
        "dataSource: pieChartDtSourcePrefix + dtSet.sigSetCid,\n" +
        "signal: sector.cid,\n" +
        "agg: 'avg'\n" +
    "});\n" +
    "}\n" +
        "\n" +
        "const props = {\n" +
        "key: dtSet.sigSetCid,\n" +
        "label: dtSet.name,\n" +
        "arcs,\n" +
    "};\n" +
        "pieChartProps.push(props);\n" +
    "}\n" +
        "\n" +
        "return pieChartProps;\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "const pieChartsProps = this.getPieChartsProps();\n" +
        "return (\n" +
        "<div className=\"container-fluid\">\n" +
        "<div className=\"row\">\n" +
        "{pieChartsProps.map(props => <SinglePieChartSection {...props} />)}\n" +
        "</div>\n" +
        "</div>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "const AnimatedPieChart = animated(StaticPieChart);\n" +
        "class SinglePieChartSection extends Component {\n" +
        "static propTypes = {\n" +
        "label: PropTypes.string,\n" +
        "arcs: PropTypes.array,\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "return (\n" +
        "<div className=\"col-6\">\n" +
        "<h4 className=\"text-center\">{this.props.label}</h4>\n" +
        "<AnimatedPieChart\n" +
        "config={{arcs: this.props.arcs}}\n" +
        "height={150}\n" +
        "legendPosition={LegendPosition.BOTTOM}\n" +
        "legendRowClass={\"col \" + styles.pieChartLegend}\n" +
        "/>\n" +
        "</div>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "class SVGChart extends Component {\n" +
        "static propTypes = {\n" +
        "config: PropTypes.object,\n" +
        "data: PropTypes.object,\n" +
        "height: PropTypes.number,\n" +
    "}\n" +
        "\n" +
        "constructor(props) {\n" +
        "super(props);\n" +
        "\n" +
        "this.noData = true;\n" +
        "this.boundUpdateDots = ::this.updateDots;\n" +
        "this.resizeListener = ::this.updateContainerWidth;\n" +
        "this.svgImg = `\n" +
        "<svg id=\"svg\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"sans-serif\">\n" +
        "<g id=\"content\">\n" +
        "<g id=\"grid\">\n" +
        "<g id=\"horizontal\"/>\n" +
        "<g id=\"vertical\"/>\n" +
        "</g>\n" +
        "<g id=\"dots\"></g>\n" +
        "</g>\n" +
        "<g id=\"legend\" x=\"0\" y=\"0\"/>\n" +
        "<text id=\"message\" fill=\"black\" x=\"50%\" y=\"50%\" />\n" +
        "</svg>`;\n" +
        "\n" +
        "this.state = {\n" +
        "width: null,\n" +
    "};\n" +
    "}\n" +
        "\n" +
        "updateContainerWidth() {\n" +
        "const rect = this.containerNode.getClientRects()[0];\n" +
        "\n" +
        "this.setState({\n" +
        "width: rect.width,\n" +
    "});\n" +
    "}\n" +
        "\n" +
        "componentDidMount() {\n" +
        "this.resizeListener();\n" +
        "window.addEventListener('resize', this.resizeListener);\n" +
    "}\n" +
        "\n" +
        "componentWillUnmount() {\n" +
        "window.removeEventListener('resize', this.resizeListener);\n" +
    "}\n" +
        "\n" +
        "updateDots(dotsSel) {\n" +
        "const messageSel = this.svgSel.select('#message');\n" +
        "const gridSel = this.svgSel.select('#grid');\n" +
        "const legendSel = this.svgSel.select('#legend');\n" +
        "\n" +
        "const conf = this.props.config;\n" +
        "const data = this.props.data;\n" +
        "\n" +
        "const width = this.state.width;\n" +
        "const height = this.props.height;\n" +
        "\n" +
        "const getCoordsFromLineConf = (lineConf) => (\n" +
        "data[lineConf.dataSource]\n" +
        ".map(kf => ({x: kf.ts, y: kf.data[lineConf.signal][lineConf.agg]}))\n" +
        ".filter(({x, y}) => x !== null && y !== null)\n" +
    ");\n" +
        "\n" +
        "let yExtents = [];\n" +
        "let xExtents = [];\n" +
        "for (const lineConf of conf.lines) {\n" +
        "yExtents = extent([...yExtents, ...getCoordsFromLineConf(lineConf).map(c => c.y)]);\n" +
        "xExtents = extent([...xExtents, ...getCoordsFromLineConf(lineConf).map(c => c.x)]);\n" +
    "}\n" +
        "\n" +
        "if (yExtents.every(v => v === undefined)) {\n" +
        "messageSel.text('No data.');\n" +
        "return;\n" +
    "}\n" +
        "\n" +
        "messageSel.text(null);\n" +
        "\n" +
        "\n" +
        "const yExtremesSpan = yExtents[1] - yExtents[0];\n" +
        "const xExtremesSpan = xExtents[1] - xExtents[0];\n" +
        "\n" +
        "const y = scaleLinear()\n" +
        ".domain([yExtents[0] - 0.5*yExtremesSpan, yExtents[1] + 0.5*yExtremesSpan])\n" +
        ".range([height, 0]);\n" +
        "\n" +
        "const x = scaleTime()\n" +
        ".domain([xExtents[0] - 0.5*xExtremesSpan, xExtents[1] + 0.5*xExtremesSpan])\n" +
        ".range([0, width]);\n" +
        "\n" +
        "gridSel.select('#vertical')\n" +
        ".selectAll('line')\n" +
        ".data(x.ticks())\n" +
        ".join('line')\n" +
        ".attr('y2', height)\n" +
        ".attr('stroke-width', 0.5)\n" +
        ".attr('stroke', 'black')\n" +
        ".attr('x1', d => x(d))\n" +
        ".attr('x2', d => x(d))\n" +
        ".attr('opacity', 0.2);\n" +
        "\n" +
        "gridSel.select('#horizontal')\n" +
        ".selectAll('line')\n" +
        ".data(y.ticks())\n" +
        ".join('line')\n" +
        ".attr('x2', width)\n" +
        ".attr('stroke-width', 0.5)\n" +
        ".attr('stroke', 'black')\n" +
        ".attr('y1', d => y(d))\n" +
        ".attr('y2', d => y(d))\n" +
        ".attr('opacity', 0.2);\n" +
        "\n" +
        "\n" +
        "legendSel.selectAll('text')\n" +
        ".data(conf.lines)\n" +
        ".join('text')\n" +
        ".attr('dominant-baseline', 'hanging')\n" +
        ".attr('font-weight', 'bold')\n" +
        ".attr('y', (d, idx) => idx*1.2 + 'em')\n" +
        ".attr('fill', d => d.color)\n" +
        ".text(d => d.label);\n" +
        "\n" +
        "const scaleFactor = zoomTransform(this.svgSel.select('#content').node()).k;\n" +
        "dotsSel.selectAll('.line')\n" +
        ".data(conf.lines)\n" +
        ".join(enter => enter.append('g').classed('line', true))\n" +
        ".attr('color', d => d.color)\n" +
        ".call(sel => sel.selectAll('circle')\n" +
        ".data(d => getCoordsFromLineConf(d))\n" +
        ".join('circle')\n" +
        ".attr('fill', 'currentColor')\n" +
        ".attr('r', 2)\n" +
        ".attr('cx', d => x(d.x))\n" +
        ".attr('cy', d => y(d.y))\n" +
    ")\n" +
        ".call(sel => sel.selectAll('.label')\n" +
        ".data(d => getCoordsFromLineConf(d).filter((coors, idx) => idx % 10 === 0))\n" +
        ".join(enter => enter.append('text').classed('label', true))\n" +
        ".attr('fill', 'currentColor')\n" +
        ".attr('x', d => x(d.x))\n" +
        ".attr('y', d => y(d.y))\n" +
        ".attr('dx', '-0.9em')\n" +
        ".attr('dy', '0.2em')\n" +
        ".attr('font-size', '5px')\n" +
        ".attr('text-anchor', 'end')\n" +
        ".attr('transform', d => `rotate(45, ${x(d.x)}, ${y(d.y)})`)\n" +
        ".attr('opacity', scaleFactor > 2 ? 1 : 0)\n" +
        ".text(d => `y: ${d.y.toFixed(0)}, time: ${moment(d.x).format('YYYY/MM/DD HH:mm')}`)\n" +
    ");\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "return (\n" +
        "<div className={this.props.className} ref={node => this.containerNode = node}>\n" +
        "{this.state.width &&\n" +
        "<SVG\n" +
        "width={this.state.width + \"px\"}\n" +
        "height={this.props.height + \"px\"}\n" +
        "source={this.svgImg}\n" +
        "init={(node) => {\n" +
        "this.svgSel = select(node);\n" +
        "const dotsSel = this.svgSel.select('#dots');\n" +
        "\n" +
        "this.svgSel.call(zoom()\n" +
        ".extent([[0, 0], [this.state.width, this.props.height]])\n" +
        ".translateExtent([[-0.5*this.state.width, -0.5*this.props.height], [1.5*this.state.width, 1.5*this.props.height]])\n" +
        ".scaleExtent([0.9, 10])\n" +
        ".on('zoom', () => {\n" +
        "this.svgSel.select('#content')\n" +
        ".attr(\"transform\", event.transform);\n" +
        "this.svgSel.selectAll('.label').attr('opacity', event.transform.k > 2 ? 1 : 0)\n" +
    "})\n" +
    ");\n" +
    "}}\n" +
        "data={{\n" +
        "dots: this.boundUpdateDots,\n" +
    "}}\n" +
        "/>\n" +
    "}\n" +
        "</div>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "const AnimatedSVGChart = animated(SVGChart);\n" +
        "class SVGChartSection extends Component {\n" +
        "static propTypes = {\n" +
        "dataSets: PropTypes.array,\n" +
    "}\n" +
        "\n" +
        "getLines() {\n" +
        "const lines = [];\n" +
        "for (const dtSet of this.props.dataSets) {\n" +
        "for (const signal of dtSet.signals) {\n" +
        "lines.push({\n" +
        "color: signal.color,\n" +
        "label: signal.label,\n" +
        "dataSource: svgChartDtSourcePrefix + dtSet.cid,\n" +
        "signal: signal.cid,\n" +
        "agg: 'avg',\n" +
    "});\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "return lines;\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "return (\n" +
        "<AnimatedSVGChart\n" +
        "config={{lines: this.getLines()}}\n" +
        "height={500}\n" +
        "/>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "@withPanelConfig\n" +
        "export default class Panel extends Component {\n" +
        "getAnimationConfig() {\n" +
        "const c = this.getPanelConfig(['animationConfig']);\n" +
        "const pieChartDtSets = this.getPanelConfig(['pieChart', 'dataSets']);\n" +
        "\n" +
        "const dataSources = {};\n" +
        "for (const dtSet of pieChartDtSets) {\n" +
        "const signals = {};\n" +
        "for (const sigCid of dtSet.sectors.map(s => s.cid)) {\n" +
        "signals[sigCid] = ['avg'];\n" +
    "}\n" +
        "\n" +
        "dataSources[pieChartDtSourcePrefix + dtSet.sigSetCid] = {\n" +
        "type: 'generic',\n" +
        "interpolation: linearInterpolation,\n" +
        "withHistory: false,\n" +
        "\n" +
        "sigSetCid: dtSet.sigSetCid,\n" +
        "signals,\n" +
        "tsSigCid: dtSet.tsSigCid,\n" +
    "};\n" +
    "}\n" +
        "\n" +
        "\n" +
        "const lineChartDtSets = this.getPanelConfig(['lineChart', 'dataSets']);\n" +
        "for (const dtSet of lineChartDtSets) {\n" +
        "const signals = {};\n" +
        "for (const sigCid of dtSet.signals.map(s => s.cid)) {\n" +
        "signals[sigCid] = ['min', 'avg', 'max'];\n" +
    "}\n" +
        "\n" +
        "dataSources[lineChartDtSourcePrefix + dtSet.cid] = {\n" +
        "type: 'timeSeries',\n" +
        "interpolation: linearInterpolation,\n" +
        "\n" +
        "sigSetCid: dtSet.cid,\n" +
        "tsSigCid: dtSet.tsSigCid,\n" +
        "signals,\n" +
    "};\n" +
    "}\n" +
        "\n" +
        "const svgChartDtSets = this.getPanelConfig(['svgChart', 'dataSets']);\n" +
        "for (const dtSet of svgChartDtSets) {\n" +
        "const signals = {};\n" +
        "for (const sigCid of dtSet.signals.map(s => s.cid)) {\n" +
        "signals[sigCid] = ['avg'];\n" +
    "}\n" +
        "\n" +
        "dataSources[svgChartDtSourcePrefix + dtSet.cid] = {\n" +
        "type: 'generic',\n" +
        "withHistory: true,\n" +
        "interpolation: linearInterpolation,\n" +
        "\n" +
        "sigSetCid: dtSet.cid,\n" +
        "tsSigCid: dtSet.tsSigCid,\n" +
        "signals\n" +
    "};\n" +
    "}\n" +
        "\n" +
        "return {\n" +
        "refreshRate: c.refreshRate,\n" +
        "initialStatus: c.initialStatus && {\n" +
        "isPlaying: !!c.initialStatus.isPlaying,\n" +
        "position: c.initialStatus.positionISO && moment.utc(c.initialStatus.positionISO).valueOf(),\n" +
        "playbackSpeedFactor: c.initialStatus.playbackSpeedFactor,\n" +
    "},\n" +
        "dataSources\n" +
    "};\n" +
    "}\n" +
        "\n" +
        "getControlsConfig() {\n" +
        "const config = this.getPanelConfig(['animationConfig', 'controls']);\n" +
        "\n" +
        "if (config.timeline.positionFormatString.length === 0) {\n" +
        "config.timeline.positionFormatString = undefined;\n" +
    "}\n" +
        "\n" +
        "const changeSpeedSteps = config.changeSpeed.steps;\n" +
        "if (changeSpeedSteps.length === 0) {\n" +
        "config.changeSpeed.steps = undefined;\n" +
    "} else {\n" +
        "config.changeSpeed.steps = changeSpeedSteps.map(step => step.step);\n" +
    "}\n" +
        "\n" +
        "if (Number.isNaN(config.jumpForward.jumpFactor))\n" +
        "config.jumpForward.jumpFactor = undefined;\n" +
        "if (Number.isNaN(config.jumpBackward.jumpFactor))\n" +
        "config.jumpBackward.jumpFactor = undefined;\n" +
        "\n" +
        "return config\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "const sectors = this.getPanelConfig(['pieChart', 'sectors']);\n" +
        "\n" +
        "return (\n" +
        "<>\n" +
        "<PanelIntroduction\n" +
        "header={this.getPanelConfig(['pageHeader'])}\n" +
        "desc={this.getPanelConfig(['pageDesc'])}\n" +
        "/>\n" +
        "\n" +
        "<RecordedAnimation {...this.getAnimationConfig()}>\n" +
        "<TimeRangeSelector />\n" +
        "<OnelineLayout {...this.getControlsConfig()} />\n" +
        "<LineChartSection\n" +
        "config={this.getPanelConfig(['lineChart'])}\n" +
        "/>\n" +
        "<hr />\n" +
        "<PieChartIntroduction\n" +
        "sectors={sectors}\n" +
        "chartLabel={this.getPanelConfig(['pieChart', 'chartLabel'])}\n" +
        "chartDesc={this.getPanelConfig(['pieChart', 'chartDesc'])}\n" +
        "/>\n" +
        "<PieChartsSection\n" +
        "sectors={sectors}\n" +
        "dataSets={this.getPanelConfig(['pieChart', 'dataSets'])}\n" +
        "/>\n" +
        "<hr />\n" +
        "<SVGChartSection\n" +
        "dataSets={this.getPanelConfig(['svgChart', 'dataSets'])}\n" +
        "/>\n" +
        "</RecordedAnimation>\n" +
        "</>\n" +
    ");\n" +
    "}\n" +
    "}\n",
    "scss": ".pi" +
        "eChartLegend {\n" +
        "text-align: center;\n" +
    "}\n" +
        "\n" +
        ".verticalDivider {\n" +
        "width: 0;\n" +
        "margin: 0;\n" +
        "padding: 0;\n" +
        "margin-left: 1rem;\n" +
        "margin-right: 1rem;\n" +
        "border-left: 1px solid rgba(0, 0, 0, 0.1);\n}"
};

    const settings_3 = {
    "params": [
        {
            "id": "animation",
            "label": "Animation configuration",
            "type": "fieldset",
            "cardinality": "1..1",
            "children": [
                {
                    "id": "refreshRate",
                    "label": "Animation refresh rate in ms",
                    "type": "number"
                },
                {
                    "id": "pollRate",
                    "label": "Animation poll rate in ms",
                    "type": "number"
                },
                {
                    "id": "isPlaying",
                    "label": "Should play on load",
                    "type": "boolean"
                },
                {
                    "id": "intervalSpanBefore",
                    "label": "Shown history duration in ms",
                    "type": "number"
                },
                {
                    "id": "intervalSpanAfter",
                    "label": "Shown future duration in ms",
                    "type": "number"
                },
                {
                    "id": "playPause",
                    "label": "Play/Pause button",
                    "type": "fieldset",
                    "cardinality": "1..1",
                    "children": [
                        {
                            "id": "visible",
                            "label": "Is visible?",
                            "type": "boolean"
                        },
                        {
                            "id": "enabled",
                            "label": "Is enabled?",
                            "type": "boolean"
                        }
                    ]
                },
                {
                    "id": "timeline",
                    "label": "Timeline",
                    "type": "fieldset",
                    "cardinality": "1..1",
                    "children": [
                        {
                            "id": "visible",
                            "label": "Is visible?",
                            "type": "boolean"
                        },
                        {
                            "id": "enabled",
                            "label": "Is enabled?",
                            "type": "boolean"
                        },
                        {
                            "id": "positionFormatString",
                            "label": "Label format of current time and date",
                            "help": "Possible format tokens can be found at https://momentjs.com/docs/#/displaying/format/",
                            "type": "string"
                        }
                    ]
                }
            ]
        },
        {
            "id": "currentLoadColor",
            "label": "Color of current CPU load",
            "type": "color"
        },
        {
            "id": "userLoadColor",
            "label": "Color of user CPU load",
            "type": "color"
        },
        {
            "id": "systemLoadColor",
            "label": "Color of system CPU load",
            "type": "color"
        },
        {
            "id": "usedMemoryColor",
            "label": "Color of used memory",
            "type": "color"
        },
        {
            "id": "freeMemoryColor",
            "label": "Color of free memory",
            "type": "color"
        },
        {
            "id": "totalMemoryColor",
            "label": "Color of total memory",
            "type": "color"
        },
        {
            "id": "diskReadColor",
            "label": "Color of disk read IO operations",
            "type": "color"
        },
        {
            "id": "diskWriteColor",
            "label": "Color of disk write IO operations",
            "type": "color"
        },
        {
            "id": "diskTotalColor",
            "label": "Color of total disk IO operations",
            "type": "color"
        }
    ],
    "jsx": "'use strict';\n" +
    "\n" +
        "import React, {Component} from 'react';\n" +
        "import moment from \"moment\";\n" +
        "import {select, event} from \"d3-selection\";\n" +
        "import {scaleTime, scaleLinear} from \"d3-scale\";\n" +
        "import {zoom, zoomTransform} from \"d3-zoom\";\n" +
        "import {extent} from \"d3-array\";\n" +
        "import {\n" +
        "LiveAnimation,\n" +
        "animated,\n" +
        "withPanelConfig,\n" +
        "SimpleBarChart,\n" +
        "LineChart,\n" +
        "OnelineLayout,\n" +
        "linearInterpolation,\n" +
        "cubicInterpolation,\n" +
        "SVG,\n" +
    "} from \"ivis\";\n" +
        "import PropTypes from \"prop-types\";\n" +
        "\n" +
        "const dtSrces = {\n" +
        "lineChart_cpu: {\n" +
        "type: 'timeSeries',\n" +
        "sigSetCid: 'lineChart_cpu',\n" +
        "signals: {\n" +
        "current_load: ['min', 'max', 'avg'],\n" +
        "user_load: ['min', 'max', 'avg'],\n" +
        "system_load: ['min', 'max', 'avg'],\n" +
    "},\n" +
        "interpolation: linearInterpolation,\n" +
        "formatData: (data) => {\n" +
        "return {\n" +
        "current_load: {\n" +
        "avg: data.cpu_load.load,\n" +
        "min: data.cpu_load.load,\n" +
        "max: data.cpu_load.load,\n" +
    "},\n" +
        "user_load: {\n" +
        "avg: data.cpu_load.user,\n" +
        "min: data.cpu_load.user,\n" +
        "max: data.cpu_load.user,\n" +
    "},\n" +
        "system_load: {\n" +
        "avg: data.cpu_load.system,\n" +
        "min: data.cpu_load.system,\n" +
        "max: data.cpu_load.system,\n" +
    "},\n" +
    "};\n" +
    "},\n" +
    "},\n" +
        "barChart_mem: {\n" +
        "type: 'generic',\n" +
        "withHistory: false,\n" +
        "signals: {\n" +
        "free: ['avg'],\n" +
        "total: ['avg'],\n" +
        "used: ['avg'],\n" +
    "},\n" +
        "interpolation: linearInterpolation,\n" +
        "formatData: (data) => {\n" +
        "return {\n" +
        "free: {\n" +
        "avg: data.mem_status.free,\n" +
    "},\n" +
        "used: {\n" +
        "avg: data.mem_status.used,\n" +
    "},\n" +
        "total: {\n" +
        "avg: data.mem_status.total,\n" +
    "},\n" +
    "};\n" +
    "}\n" +
    "},\n" +
        "svg_disk: {\n" +
        "type: 'generic',\n" +
        "withHistory: true,\n" +
        "signals: {\n" +
        "readIOPerSec: ['avg'],\n" +
        "writeIOPerSec: ['avg'],\n" +
        "totalIOPerSec: ['avg'],\n" +
    "},\n" +
        "interpolation: cubicInterpolation,\n" +
        "formatData: (data) => {\n" +
        "return {\n" +
        "readIOPerSec: {\n" +
        "avg: data.disk_load.readIOPerSec,\n" +
    "},\n" +
        "writeIOPerSec: {\n" +
        "avg: data.disk_load.writeIOPerSec,\n" +
    "},\n" +
        "totalIOPerSec: {\n" +
        "avg: data.disk_load.totalIOPerSec,\n" +
    "},\n" +
    "};\n" +
    "},\n" +
    "}\n" +
    "};\n" +
        "\n" +
        "class Frame extends Component {\n" +
        "static propTypes = {\n" +
        "name: PropTypes.string,\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "return (\n" +
        "<div className={\"container-fluid border border-dark my-1 p-1 pb-4\"}>\n" +
        "<h4 className=\"text-center text-dark\">{this.props.name}</h4>\n" +
        "<div className=\"container-fluid\">\n" +
        "{this.props.children}\n" +
        "</div>\n" +
        "</div>\n" +
    ")\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "const AnimatedLineChart = animated(LineChart);\n" +
        "class CPU extends Component {\n" +
        "static propTypes = {\n" +
        "currentLoadColor: PropTypes.object.isRequired,\n" +
        "userLoadColor: PropTypes.object.isRequired,\n" +
        "systemLoadColor: PropTypes.object.isRequired,\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "const config = {\n" +
        "yAxes: [{visible: true, belowMin: 0.1, aboveMax: 0.1}],\n" +
        "signalSets: [\n" +
        "{\n" +
        "cid: dtSrces.lineChart_cpu.sigSetCid,\n" +
        "signals: [\n" +
        "{\n" +
        "label: 'Current load',\n" +
        "color: this.props.currentLoadColor,\n" +
        "cid: 'current_load',\n" +
    "},\n" +
        "{\n" +
        "label: 'User load',\n" +
        "color: this.props.userLoadColor,\n" +
        "cid: 'user_load',\n" +
    "},\n" +
        "{\n" +
        "label: 'System load',\n" +
        "color: this.props.systemLoadColor,\n" +
        "cid: 'system_load',\n" +
    "}\n" +
    "]\n" +
    "}\n" +
    "]\n" +
    "};\n" +
        "\n" +
        "return (\n" +
        "<Frame name={\"CPU load\"}>\n" +
        "<AnimatedLineChart\n" +
        "config={config}\n" +
        "height={300}\n" +
        "withBrush={false}\n" +
        "animationDataFormatter={(data) => [data.lineChart_cpu]}\n" +
        "/>\n" +
        "</Frame>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "const AnimatedBarChart = animated(SimpleBarChart);\n" +
        "class Memory extends Component {\n" +
        "static propTypes = {\n" +
        "usedMemoryColor: PropTypes.object,\n" +
        "freeMemoryColor: PropTypes.object,\n" +
        "totalMemoryColor: PropTypes.object,\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "const config = {\n" +
        "yAxis: {\n" +
        "aboveMax: 0.2,\n" +
        "includeMin: 0,\n" +
    "},\n" +
        "groups: [\n" +
        "{\n" +
        "label: 'Total',\n" +
        "colors: [this.props.totalMemoryColor],\n" +
        "values: [\n" +
        "{\n" +
        "dataSource: 'barChart_mem',\n" +
        "signal: 'total',\n" +
        "agg: 'avg',\n" +
    "}\n" +
    "]\n" +
    "},\n" +
        "{\n" +
        "label: 'Used',\n" +
        "colors: [this.props.usedMemoryColor],\n" +
        "values: [\n" +
        "{\n" +
        "dataSource: 'barChart_mem',\n" +
        "signal: 'used',\n" +
        "agg: 'avg',\n" +
    "}\n" +
    "]\n" +
    "},\n" +
        "{\n" +
        "label: 'Free',\n" +
        "colors: [this.props.freeMemoryColor],\n" +
        "values: [\n" +
        "{\n" +
        "dataSource: 'barChart_mem',\n" +
        "signal: 'free',\n" +
        "agg: 'avg',\n" +
    "}\n" +
    "]\n" +
    "},\n" +
    "]\n" +
    "};\n" +
        "\n" +
        "return (\n" +
        "<Frame name={\"Memory\"}>\n" +
        "<AnimatedBarChart\n" +
        "config={config}\n" +
        "height={150}\n" +
        "groupPadding={0.001}\n" +
        "codomainLabel=\"In bytes\"\n" +
        "valueFormatSpecifier=\".2~s\"\n" +
        "isHorizontal\n" +
        "withTickLines\n" +
        "withBarValues\n" +
        "/>\n" +
        "</Frame>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "class SVGChart extends Component {\n" +
        "static propTypes = {\n" +
        "config: PropTypes.object,\n" +
        "data: PropTypes.object,\n" +
        "height: PropTypes.number,\n" +
    "}\n" +
        "\n" +
        "constructor(props) {\n" +
        "super(props);\n" +
        "\n" +
        "this.noData = true;\n" +
        "this.boundUpdateDots = ::this.updateDots;\n" +
        "this.resizeListener = ::this.updateContainerWidth;\n" +
        "this.svgImg = `\n" +
        "<svg id=\"svg\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
        "<g id=\"content\">\n" +
        "<g id=\"grid\">\n" +
        "<g id=\"horizontal\"/>\n" +
        "<g id=\"vertical\"/>\n" +
        "</g>\n" +
        "<g id=\"dots\"></g>\n" +
        "</g>\n" +
        "<g id=\"legend\" x=\"0\" y=\"0\"/>\n" +
        "<text id=\"message\" fill=\"black\" x=\"50%\" y=\"50%\" />\n" +
        "</svg>`;\n" +
        "\n" +
        "this.state = {\n" +
        "width: null,\n" +
    "};\n" +
    "}\n" +
        "\n" +
        "updateContainerWidth() {\n" +
        "const rect = this.containerNode.getClientRects()[0];\n" +
        "\n" +
        "this.setState({\n" +
        "width: rect.width,\n" +
    "});\n" +
    "}\n" +
        "\n" +
        "componentDidMount() {\n" +
        "this.resizeListener();\n" +
        "window.addEventListener('resize', this.resizeListener);\n" +
    "}\n" +
        "\n" +
        "componentWillUnmount() {\n" +
        "window.removeEventListener('resize', this.resizeListener);\n" +
    "}\n" +
        "\n" +
        "updateDots(dotsSel) {\n" +
        "const messageSel = this.svgSel.select('#message');\n" +
        "const gridSel = this.svgSel.select('#grid');\n" +
        "const legendSel = this.svgSel.select('#legend');\n" +
        "\n" +
        "const conf = this.props.config;\n" +
        "const data = this.props.data;\n" +
        "\n" +
        "const width = this.state.width;\n" +
        "const height = this.props.height;\n" +
        "\n" +
        "const getCoordsFromLineConf = (lineConf) => (\n" +
        "data[lineConf.dataSource]\n" +
        ".map(kf => ({x: kf.ts, y: kf.data[lineConf.signal][lineConf.agg]}))\n" +
        ".filter(({x, y}) => x !== null && y !== null)\n" +
    ");\n" +
        "\n" +
        "let yExtents = [];\n" +
        "let xExtents = [];\n" +
        "for (const lineConf of conf.lines) {\n" +
        "yExtents = extent([...yExtents, ...getCoordsFromLineConf(lineConf).map(c => c.y)]);\n" +
        "xExtents = extent([...xExtents, ...getCoordsFromLineConf(lineConf).map(c => c.x)]);\n" +
    "}\n" +
        "\n" +
        "if (yExtents.every(v => v === undefined)) {\n" +
        "messageSel.text('No data.');\n" +
        "return;\n" +
    "}\n" +
        "\n" +
        "messageSel.text(null);\n" +
        "\n" +
        "\n" +
        "const yExtremesSpan = yExtents[1] - yExtents[0];\n" +
        "const xExtremesSpan = xExtents[1] - xExtents[0];\n" +
        "\n" +
        "const y = scaleLinear()\n" +
        ".domain([yExtents[0] - 0.5*yExtremesSpan, yExtents[1] + 0.5*yExtremesSpan])\n" +
        ".range([height, 0]);\n" +
        "\n" +
        "const x = scaleTime()\n" +
        ".domain([xExtents[0] - 0.5*xExtremesSpan, xExtents[1] + 0.5*xExtremesSpan])\n" +
        ".range([0, width]);\n" +
        "\n" +
        "gridSel.select('#vertical')\n" +
        ".selectAll('line')\n" +
        ".data(x.ticks())\n" +
        ".join('line')\n" +
        ".attr('y2', height)\n" +
        ".attr('stroke-width', 0.5)\n" +
        ".attr('stroke', 'black')\n" +
        "." +
        "attr('x1', d => x(d))\n" +
        ".attr('x2', d => x(d))\n" +
        ".attr('opacity', 0.2);\n" +
        "\n" +
        "gridSel.select('#horizontal')\n" +
        ".selectAll('line')\n" +
        ".data(y.ticks())\n" +
        ".join('line')\n" +
        ".attr('x2', width)\n" +
        ".attr('stroke-width', 0.5)\n" +
        ".attr('stroke', 'black')\n" +
        ".attr('y1', d => y(d))\n" +
        ".attr('y2', d => y(d))\n" +
        ".attr('opacity', 0.2);\n" +
        "\n" +
        "\n" +
        "legendSel.selectAll('text')\n" +
        ".data(conf.lines)\n" +
        ".join('text')\n" +
        ".attr('dominant-baseline', 'hanging')\n" +
        ".attr('font-weight', 'bold')\n" +
        ".attr('y', (d, idx) => idx*1.2 + 'em')\n" +
        ".attr('fill', d => d.color)\n" +
        ".text(d => d.label);\n" +
        "\n" +
        "const scaleFactor = zoomTransform(this.svgSel.select('#content').node()).k;\n" +
        "dotsSel.selectAll('.line')\n" +
        ".data(conf.lines)\n" +
        ".join(enter => enter.append('g').classed('line', true))\n" +
        ".attr('color', d => d.color)\n" +
        ".call(sel => sel.selectAll('circle')\n" +
        ".data(d => getCoordsFromLineConf(d))\n" +
        ".join('circle')\n" +
        ".attr('fill', 'currentColor')\n" +
        ".attr('r', 2)\n" +
        ".attr('cx', d => x(d.x))\n" +
        ".attr('cy', d => y(d.y))\n" +
    ")\n" +
        ".call(sel => sel.selectAll('.label')\n" +
        ".data(d => getCoordsFromLineConf(d).filter((coors, idx) => idx % 10 === 0))\n" +
        ".join(enter => enter.append('text').classed('label', true))\n" +
        ".attr('fill', 'currentColor')\n" +
        ".attr('x', d => x(d.x))\n" +
        ".attr('y', d => y(d.y))\n" +
        ".attr('dx', '-0.9em')\n" +
        ".attr('dy', '0.2em')\n" +
        ".attr('font-size', '5px')\n" +
        ".attr('text-anchor', 'end')\n" +
        ".attr('transform', d => `rotate(45, ${x(d.x)}, ${y(d.y)})`)\n" +
        ".attr('opacity', scaleFactor > 2 ? 1 : 0)\n" +
        ".text(d => `y: ${d.y.toFixed(0)}, time: ${moment(d.x).format('YYYY/MM/DD HH:mm')}`)\n" +
    ");\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "return (\n" +
        "<div className={this.props.className} ref={node => this.containerNode = node}>\n" +
        "{this.state.width &&\n" +
        "<SVG\n" +
        "width={this.state.width + \"px\"}\n" +
        "height={this.props.height + \"px\"}\n" +
        "source={this.svgImg}\n" +
        "init={(node) => {\n" +
        "this.svgSel = select(node);\n" +
        "const dotsSel = this.svgSel.select('#dots');\n" +
        "\n" +
        "this.svgSel.call(zoom()\n" +
        ".extent([[0, 0], [this.state.width, this.props.height]])\n" +
        ".translateExtent([[-0.5*this.state.width, -0.5*this.props.height], [1.5*this.state.width, 1.5*this.props.height]])\n" +
        ".scaleExtent([0.9, 10])\n" +
        ".on('zoom', () => {\n" +
        "this.svgSel.select('#content')\n" +
        ".attr(\"transform\", event.transform);\n" +
        "this.svgSel.selectAll('.label').attr('opacity', event.transform.k > 2 ? 1 : 0)\n" +
    "})\n" +
    ");\n" +
    "}}\n" +
        "data={{\n" +
        "dots: this.boundUpdateDots,\n" +
    "}}\n" +
        "/>\n" +
    "}\n" +
        "</div>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "const AnimatedSVGChart = animated(SVGChart);\n" +
        "\n" +
        "class Disk extends Component {\n" +
        "static propTypes = {\n" +
        "diskReadColor: PropTypes.object,\n" +
        "diskWriteColor: PropTypes.object,\n" +
        "diskTotalColor: PropTypes.object,\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "const config = {\n" +
        "lines: [\n" +
        "{\n" +
        "color: this.props.diskReadColor,\n" +
        "label: 'Read IO operations per sec.',\n" +
        "dataSource: 'svg_disk',\n" +
        "signal: 'readIOPerSec',\n" +
        "agg: 'avg',\n" +
    "},\n" +
        "{\n" +
        "color: this.props.diskWriteColor,\n" +
        "label: 'Write IO operations per sec.',\n" +
        "dataSource: 'svg_disk',\n" +
        "signal: 'writeIOPerSec',\n" +
        "agg: 'avg',\n" +
    "},\n" +
        "{\n" +
        "color: this.props.diskTotalColor,\n" +
        "label: 'Total IO operations per sec.',\n" +
        "dataSource: 'svg_disk',\n" +
        "signal: 'totalIOPerSec',\n" +
        "agg: 'avg',\n" +
    "}\n" +
    "]\n" +
    "};\n" +
        "\n" +
        "return (\n" +
        "<Frame name={\"Disk load\"}>\n" +
        "<AnimatedSVGChart\n" +
        "height={300}\n" +
        "config={config}\n" +
        "/>\n" +
        "</Frame>\n" +
    ");\n" +
    "}\n" +
    "}\n" +
        "\n" +
        "@withPanelConfig\n" +
        "export default class Panel extends Component {\n" +
        "getAnimationConfig() {\n" +
        "const animConf = this.getPanelConfig(['animation']);\n" +
        "return {\n" +
        "pollRate: animConf.pollRate,\n" +
        "refreshRate: animConf.refreshRate,\n" +
        "initialStatus: {\n" +
        "isPlaying: animConf.isPlaying,\n" +
    "},\n" +
        "dataSources: dtSrces,\n" +
        "animationId: 'monitor',\n" +
        "intervalSpanAfter: moment.duration(animConf.intervalSpanAfter),\n" +
        "intervalSpanBefore: moment.duration(animConf.intervalSpanBefore),\n" +
    "};\n" +
    "}\n" +
        "\n" +
        "render() {\n" +
        "const timelineConf = this.getPanelConfig(['animation', 'timeline']);\n" +
        "if (timelineConf.positionFormatString === \"\") timelineConf.positionFormatString = undefined;\n" +
        "\n" +
        "return (\n" +
        "<LiveAnimation {...this.getAnimationConfig()}>\n" +
        "<OnelineLayout\n" +
        "playPause={this.getPanelConfig(['animation', 'playPause'])}\n" +
        "timeline={timelineConf}\n" +
        "/>\n" +
        "<CPU\n" +
        "currentLoadColor={this.getPanelConfig(['currentLoadColor'])}\n" +
        "userLoadColor={this.getPanelConfig(['userLoadColor'])}\n" +
        "systemLoadColor={this.getPanelConfig(['systemLoadColor'])}\n" +
        "/>\n" +
        "<Memory\n" +
        "usedMemoryColor={this.getPanelConfig(['usedMemoryColor'])}\n" +
        "freeMemoryColor={this.getPanelConfig(['freeMemoryColor'])}\n" +
        "totalMemoryColor={this.getPanelConfig(['totalMemoryColor'])}\n" +
        "/>\n" +
        "<Disk\n" +
        "diskReadColor={this.getPanelConfig(['diskReadColor'])}\n" +
        "diskWriteColor={this.getPanelConfig(['diskWriteColor'])}\n" +
        "diskTotalColor={this.getPanelConfig(['diskTotalColor'])}\n" +
        "/>\n" +
        "</LiveAnimation>\n" +
    ");\n" +
    "}\n" +
    "}\n",
    "scss": ""
};

    await knex('templates').insert({
        id: 10,
        name: 'Animation showcase template n.1',
        description: 'Template presenting the use of recorded animation in combination with line chart and bar chart.',
        type: 'jsx',
        settings: JSON.stringify(settings_1),
        state: 1,
        namespace: 1
    });
    await knex('templates').insert({
        id: 11,
        name: 'Animation showcase template n.2',
        description: 'Template presenting the use of recorded animation in combination with line chart, pie charts and custom SVG graphic.',
        type: 'jsx',
        settings: JSON.stringify(settings_2),
        state: 1,
        namespace: 1
    });
    await knex('templates').insert({
        id: 12,
        name: 'Animation showcase template n.3',
        description: 'Template presenting the use of custom live animation in combination with line chart, bar chart and SVG graphic.',
        type: 'jsx',
        settings: JSON.stringify(settings_3),
        state: 1,
        namespace: 1
    });

    await knex('workspaces').insert({
        id: 10,
        name: 'Animation',
        description: 'Workspace showcasing the use of animations in combination with various visualizations.',
        order: 1,
        namespace: 1
    });


    const params_1 = {
  "animationConfig": {
    "refreshRate": "",
    "initialStatus": {
      "isPlaying": true,
      "positionISO": "",
      "playbackSpeedFactor": ""
    },
    "controls": {
      "playPause": {
        "visible": true,
        "enabled": true
      },
      "stop": {
        "visible": false,
        "enabled": true
      },
      "jumpForward": {
        "visible": false,
        "enabled": true,
        "jumpFactor": "0.5"
      },
      "jumpBackward": {
        "visible": false,
        "enabled": true,
        "jumpFactor": "0.5"
      },
      "changeSpeed": {
        "visible": true,
        "enabled": true,
        "steps": []
      },
      "timeline": {
        "visible": true,
        "enabled": true,
        "positionFormatString": ""
      }
    }
  },
  "pageHeader": "COVID-19 in Italy",
  "pageDesc": "Italy is one of the countries that has been hit the hardest with the COVID-19 pandemic.  The following visualizations should provide you with basic overview of how the pandemic progressed throughout the country.\\n",
  "linechart": {
    "dataSets": [
      {
        "cid": "it_21",
        "tsSigCid": "ts",
        "signals": [
          {
            "label": "Piedmont confirmed",
            "color": {
              "r": 223,
              "g": 212,
              "b": 72,
              "a": 1
            },
            "cid": "total_confirmed"
          }
        ]
      },
      {
        "cid": "it_25",
        "tsSigCid": "ts",
        "signals": [
          {
            "label": "Lombardy confirmed",
            "color": {
              "r": 218,
              "g": 23,
              "b": 23,
              "a": 1
            },
            "cid": "total_confirmed"
          }
        ]
      },
      {
        "cid": "it",
        "tsSigCid": "ts",
        "signals": [
          {
            "label": "Italy confirmed",
            "color": {
              "r": 65,
              "g": 117,
              "b": 5,
              "a": 1
            },
            "cid": "total_confirmed"
          }
        ]
      }
    ]
  },
  "barchart": {
    "chartLabel": "Statistics since the outbreak",
    "domainLabel": "",
    "codomainLabel": "Number of people",
    "valueFormatSpecifier": "",
    "chartDesc": "This bar chart illustrates the accumulated data measurements since the beginning of the COVID-19 pandemic. ",
    "categories": [
      {
        "id": "confirmed",
        "label": "Confirmed",
        "desc": "Number of confirmed cases of COVID-19.",
        "color": {
          "r": 228,
          "g": 213,
          "b": 75,
          "a": 1
        }
      },
      {
        "id": "deceased",
        "label": "Deceased",
        "desc": "Number of deaths caused by the COVID-19.",
        "color": {
          "r": 202,
          "g": 101,
          "b": 114,
          "a": 1
        }
      },
      {
        "id": "recovered",
        "label": "Recovered",
        "desc": "Number of people who recovered from the illness.",
        "color": {
          "r": 79,
          "g": 129,
          "b": 189,
          "a": 1
        }
      }
    ],
    "dataSets": [
      {
        "name": "Lombardy",
        "sigSetCid": "it_25",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      },
      {
        "name": "Emilia-Romagna",
        "sigSetCid": "it_45",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      },
      {
        "name": "Veneto",
        "sigSetCid": "it_34",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      },
      {
        "name": "Friuli Venezia Giulia",
        "sigSetCid": "it_36",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      },
      {
        "name": "Marche",
        "sigSetCid": "it_57",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      },
      {
        "name": "Campania",
        "sigSetCid": "it_72",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      },
      {
        "name": "Lazio",
        "sigSetCid": "it_62",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      },
      {
        "name": "Piedmont",
        "sigSetCid": "it_21",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      },
      {
        "name": "Tuscany",
        "sigSetCid": "it_52",
        "tsSigCid": "ts",
        "categories": [
          {
            "categoryId": "confirmed",
            "cid": "total_confirmed"
          },
          {
            "categoryId": "deceased",
            "cid": "total_deceased"
          },
          {
            "categoryId": "recovered",
            "cid": "total_recovered"
          }
        ]
      }
    ]
  }
    };

    const params_2 = {
    "animationConfig": {
        "refreshRate": "50",
        "initialStatus": {
            "positionISO": "2020-07-19T10:50:32Z",
            "playbackSpeedFactor": "50"
        },
        "controls": {
            "playPause": {
                "visible": true,
                "enabled": true
            },
            "stop": {
                "visible": true,
                "enabled": true
            },
            "jumpForward": {
                "visible": true,
                "enabled": true,
                "jumpFactor": ""
            },
            "jumpBackward": {
                "visible": true,
                "enabled": true,
                "jumpFactor": ""
            },
            "changeSpeed": {
                "visible": true,
                "enabled": true,
                "steps": []
            },
            "timeline": {
                "visible": true,
                "enabled": true,
                "positionFormatString": ""
            }
        }
    },
    "pageHeader": "COVID-19 in Italy",
    "pageDesc": "Italy is one of the countries that has been hit the hardest with the COVID-19 pandemic.  The following visualizations should provide you with basic overview of how the pandemic progressed throughout the country.\\n\\nThere are several sections in this panel. After the introduction you will see a 'Chart types' section, that explains all of the visualizations used. Following the 'Chart types' section, there is the 'Data sets' section, where you can find the animation controls and the visualizations in the context of various districts in Italy.",
    "lineChart": {
        "dataSets": [
            {
                "cid": "it",
                "tsSigCid": "ts",
                "signals": [
                    {
                        "label": "Italy negative",
                        "color": {
                            "r": 145,
                            "g": 76,
                            "b": 84,
                            "a": 1
                        },
                        "cid": "total_negative"
                    },
                    {
                        "label": "Italy positive",
                        "color": {
                            "r": 208,
                            "g": 2,
                            "b": 27,
                            "a": 1
                        },
                        "cid": "total_confirmed"
                    }
                ]
            },
            {
                "cid": "it_25",
                "tsSigCid": "ts",
                "signals": [
                    {
                        "label": "Lombardy negative",
                        "color": {
                            "r": 64,
                            "g": 89,
                            "b": 119,
                            "a": 1
                        },
                        "cid": "total_negative"
                    },
                    {
                        "label": "Lombardy positive",
                        "color": {
                            "r": 74,
                            "g": 144,
                            "b": 226,
                            "a": 1
                        },
                        "cid": "total_confirmed"
                    }
                ]
            },
            {
                "cid": "it_21",
                "tsSigCid": "ts",
                "signals": [
                    {
                        "label": "Piedmont negative",
                        "color": {
                            "r": 96,
                            "g": 126,
                            "b": 62,
                            "a": 1
                        },
                        "cid": "total_negative"
                    },
                    {
                        "label": "Piedmont positive",
                        "color": {
                            "r": 126,
                            "g": 202,
                            "b": 37,
                            "a": 1
                        },
                        "cid": "total_confirmed"
                    }
                ]
            }
        ]
    },
    "pieChart": {
        "chartLabel": "Positive to negative ratio",
        "chartDesc": "Pie charts displaying the COVID test results in Italy's districts.",
        "sectors": [
            {
                "id": "negative",
                "label": "Negative",
                "desc": "Portion of test that came out negative.",
                "color": {
                    "r": 208,
                    "g": 2,
                    "b": 27,
                    "a": 1
                }
            },
            {
                "id": "positive",
                "label": "Positive",
                "desc": "Portion of test that came out positive.",
                "color": {
                    "r": 74,
                    "g": 144,
                    "b": 226,
                    "a": 1
                }
            }
        ],
        "dataSets": [
            {
                "name": "Italy",
                "sigSetCid": "it",
                "tsSigCid": "ts",
                "sectors": [
                    {
                        "cid": "total_negative",
                        "sectorId": "negative"
                    },
                    {
                        "cid": "total_confirmed",
                        "sectorId": "positive"
                    }
                ]
            },
            {
                "name": "Lombardy",
                "sigSetCid": "it_25",
                "tsSigCid": "ts",
                "sectors": [
                    {
                        "cid": "total_negative",
                        "sectorId": "negative"
                    },
                    {
                        "cid": "total_confirmed",
                        "sectorId": "positive"
                    }
                ]
            },
            {
                "name": "Piedmont",
                "sigSetCid": "it_21",
                "tsSigCid": "ts",
                "sectors": [
                    {
                        "cid": "total_negative",
                        "sectorId": "negative"
                    },
                    {
                        "cid": "total_confirmed",
                        "sectorId": "positive"
                    }
                ]
            }
        ]
    },
    "svgChart": {
        "dataSets": [
            {
                "cid": "it",
                "tsSigCid": "ts",
                "signals": [
                    {
                        "label": "Num. of tests in Italy",
                        "color": {
                            "r": 65,
                            "g": 117,
                            "b": 5,
                            "a": 1
                        },
                        "cid": "total_tested"
                    }
                ]
            },
            {
                "cid": "it_25",
                "tsSigCid": "ts",
                "signals": [
                    {
                        "label": "Num. of tests in Lombardy",
                        "color": {
                            "r": 201,
                            "g": 149,
                            "b": 62,
                            "a": 1
                        },
                        "cid": "total_tested"
                    }
                ]
            },
            {
                "cid": "it_21",
                "tsSigCid": "ts",
                "signals": [
                    {
                        "label": "Num. of tests in Piedmont",
                        "color": {
                            "r": 161,
                            "g": 92,
                            "b": 221,
                            "a": 1
                        },
                        "cid": "total_tested"
                    }
                ]
            }
        ]
    }
    };

    const params_3 = {
        "animation": {
            "refreshRate": "50",
            "pollRate": "800",
            "isPlaying": false,
            "intervalSpanBefore": "5000",
            "intervalSpanAfter": "1000",
            "playPause": {
                "visible": true,
                "enabled": true
            },
            "timeline": {
                "visible": true,
                "enabled": true,
                "positionFormatString": ""
            }
        },
        "currentLoadColor": {
            "r": 197,
            "g": 71,
            "b": 71,
            "a": 1
        },
        "userLoadColor": {
            "r": 74,
            "g": 144,
            "b": 226,
            "a": 1
        },
        "systemLoadColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 1
        },
        "usedMemoryColor": {
            "r": 214,
            "g": 74,
            "b": 91,
            "a": 0.98
        },
        "freeMemoryColor": {
            "r": 74,
            "g": 144,
            "b": 226,
            "a": 1
        },
        "totalMemoryColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 1
        },
        "diskReadColor": {
            "r": 74,
            "g": 144,
            "b": 226,
            "a": 1
        },
        "diskWriteColor": {
            "r": 65,
            "g": 117,
            "b": 5,
            "a": 1
        },
        "diskTotalColor": {
            "r": 139,
            "g": 87,
            "b": 42,
            "a": 1
        }
    };

    await knex('panels').insert({
        id: 10,
        name: 'Animation showcase panel n.1',
        description: 'Visualization of COVID-19 pandemic\'s progression in Italy.',
        workspace: 10,
        order: 1,
        template: 10,
        params: JSON.stringify(params_1),
        namespace: 1
    });
    await knex('panels').insert({
        id: 11,
        name: 'Animation showcase panel n.2',
        description: 'Visualization of COVID-19 pandemic\'s progression in Italy.',
        workspace: 10,
        order: 2,
        template: 11,
        params: JSON.stringify(params_2),
        namespace: 1
    });
    await knex('panels').insert({
        id: 12,
        name: 'Animation showcase panel n.3',
        description: 'Panel presenting real time data measured at the server.',
        workspace: 10,
        order: 3,
        template: 12,
        params: JSON.stringify(params_3),
        namespace: 1
    });

    await knex('workspaces').where('id', 10).update({default_panel: 10});
})();

"use strict";

/**
 * Defines {@link LiveAnimation} and compound components.
 *
 * @module LiveAnimation
 */
import React, {Component} from "react";
import PropTypes from "prop-types";
import moment from "moment";
import _ from "lodash";

import axios from "../lib/axios";
import {getUrl} from "../lib/urls";
import {
    AnimationStatusContext,
    AnimationControlContext,
    AnimationDataContext,
} from "./AnimationCommon";
import {SigSetInterpolator} from "../lib/animation-helpers";
import {withAsyncErrorHandler} from "../lib/error-handling";
import {withComponentMixins} from "../lib/decorator-helpers";
import {intervalAccessMixin, TimeContext} from "./TimeContext";
import {IntervalSpec} from "./TimeInterval";

const minPollRate = 50;

/**
 * Implements Live animation - animation of real-time data by synchronizing with
 * a [Master animation instance](./mai.md). Is composed of {@link
 * AnimationDataAccess} and {@link Animation}.
 *
 * @param {object} props
 * @param {string} props.animationId - identifier of the MAI to synchronize
    * with.
 * @param {moment.duration} [props.intervalSpanBefore = moment.duration(10, 'm')] - Interval defining the
    * span between the left boundary of the viewed interval and the playback
    * position. ([moment.duration](https://momentjs.com/docs/#/durations/))
 * @param {moment.duration} [props.intervalSpanAfter = moment.duration(3, 'm')] - Interval defining the
    * span between the playback position and the right boundary of the viewed
    * interval. ([moment.duration](https://momentjs.com/docs/#/durations/))
 * @param {number} [props.pollRate = 1000] - Number of milliseconds between
    * subsequent polls of the MAI.
 * @param {object} [props.initialStatus = {}] - Initial animation's state.
 * @param {boolean} [props.initialStatus.isPlaying = false] - `true` if the
    * animation should start playing once initialized, `false` otherwise.
 * @param {object} props.dataSources - Data sources' configuration to pass to
    * {@link AnimationDataAccess}.
 * @param {object} props.dataSources.dataSourceKey - Configuration of the
    * Data source with the given key. Note: `dataSourceKey` only stands for the
    * actual Data source's key. This object is passed to the constructor of the
    * configured Data source's type as `config`.
 * @param {string} props.dataSources.dataSourceKey.type - Type of the Data
    * source to configure. The types are keys of the {@link dataSourceTypes} constant.
 */
class LiveAnimation extends Component {
    static propTypes = {
        dataSources: PropTypes.object.isRequired,
        animationId: PropTypes.string.isRequired,

        intervalSpanBefore: PropTypes.object,
        intervalSpanAfter: PropTypes.object,

        initialStatus: PropTypes.object,

        pollRate: PropTypes.number,

        children: PropTypes.node,
    }

    static defaultProps = {
        intervalSpanBefore: moment.duration(10, 'm'),
        intervalSpanAfter: moment.duration(3, 'm'),

        pollRate: 1000,
        initialStatus: {},
    }

    constructor(props) {
        super(props);

        this.initialIntervalSpec = new IntervalSpec(
            moment(Date.now() - props.intervalSpanBefore.asMilliseconds()),
            moment(Date.now() + props.intervalSpanAfter.asMilliseconds()),
            null,
            null
        );
    }

    render() {
        const pollRate = this.props.pollRate === null || Number.isNaN(this.props.pollRate) ?
            minPollRate :
            Math.max(minPollRate, this.props.pollRate)
        ;


        const childrenRender = (props) => {
            return (
                <Animation
                    animationId={this.props.animationId}
                    pollRate={pollRate}

                    intervalSpanBefore={this.props.intervalSpanBefore}
                    intervalSpanAfter={this.props.intervalSpanAfter}

                    initialStatus={this.props.initialStatus}
                    {...props}>
                    {this.props.children}
                </Animation>
            );
        };


        return (
            <TimeContext
                initialIntervalSpec={this.initialIntervalSpec}
            >
                <AnimationDataAccess
                    dataSources={this.props.dataSources}

                    render={childrenRender}
                />
            </TimeContext>
        );
    }
}

/**
 * GenericDataSource represents the simplest form of a Data source. It generates
 * almost unprocessed data for current frame and optionally for past couple of
 * keyframes.
 *
 * @param {object} config - Configuration object of the Data source.
 * @param {{cid: string, signalCids: string[]}[]} config.sigSets - Signal sets to be animated.
 * @param {string[]} [config.singnalAggs = ['avg']] - Aggregation functions that should
    * be animated for each signal.
 * @param {{func: function, arity: number}} config.interpolation - Interpolation function to be used.
 * @param {number} config.history - Number of milliseconds worht of path keyframes to
    * generate.
 * @param {function} config.formatData - Formats data before the Data source stores
    * them. The function is given all the data MAI is generating
    * (`animationStatus.data`), the result is stored as a keyframe.
 * @param {object} dataAccess - 'Parent' instance of {@link AnimationDataAccess}.
 */
class GenericDataSource {
    constructor(config, dataAccess) {
        this.conf = {
            formatData: config.formatData || null,
            history: config.history || null,
            intpArity: config.interpolation.arity,
            signalAggs: config.signalAggs || ['avg'],
        };

        this.dataAccess = dataAccess;

        this.sigSets = [];
        for (const sigSetConf of config.sigSets) {
            const signalCids = sigSetConf.signalCids;
            this.sigSets.push({
                cid: sigSetConf.cid,
                signalCids,
                intp: new SigSetInterpolator(signalCids, this.conf.signalAggs, config.interpolation),
            });
        }

        this.clear();
    }

    /**
     * Adds new keyframe to the Data source's keyframe queue.
     *
     * @param {object} kf - MAI's generated data (i.e. a keyframe).
     */
    addKeyframe(kf) {
        const data = this.conf.formatData ? this.conf.formatData(kf.data) : kf.data;

        this.buffer.push({ts: kf.ts, data});
    }

    clear() {
        for (const sigSet of this.sigSets) {
            sigSet.intp.clearArgs();
        }

        this.buffer = [];
        this.history = [];

        this.tss = [];
        this.lastShiftNull = true;
        this.kfPillow = 0;
    }

    getEmptyData() {
        const emptyData = {};
        for (const sigSet of this.sigSets) {
            if (this.conf.history) emptyData[sigSet.cid] = [];
            else emptyData[sigSet.cid] = sigSet.intp.interpolate(-1);
        }

        return emptyData;
    }

    /**
     * GenericDataSource's keyframe data. Note that the properties' names are
     * only descriptive and not the actual keys.
     *
     * @typedef {object} GenericKeyframeData
     *
     * @prop {object} signalSetCid - Signals of the given signal set to be
        * visualized.
     * @prop {object} signalSetCid.signalCid - Aggragations of the given signal
        * to be visualized.
     * @prop {number} signalSetCid.signalCid.aggFuncName - Value of the given
        * aggregation function to be visualized.
     */
    /**
     * Generates visualization data.
     *
     * @param {number} ts - Unix timestamp for which to generate visualization
        * data.
     * @returns {GenericKeyframeData | {ts: number, data:
        * GenericKeyframeData}} - Visualization data generated by the Data
        * source. Format of
        * visualization data depends on the `history` config. property.
     */
    shiftTo(ts) {
        let minKfCount = this.conf.intpArity;

        if (this.lastShiftNull) {
            minKfCount += this.kfPillow;
        }

        const result = this._shiftTo(ts, minKfCount);

        if (!this.lastShiftNull && result === null) {
            this.kfPillow += 1;
        }
        this.lastShiftNull = result === null;

        return result;
    }

    _shiftTo(ts, minKfCount) {
        if (this.buffer.length < minKfCount) return null;

        if (this.conf.history) {
            const historyLastTs = this.history.length > 0 ? this.history[this.history.length - 1].ts : -1;
            let i = this.buffer.findIndex(kf => kf.ts > historyLastTs);
            while (i >= 0 && this.buffer.length > i && this.buffer[i].ts < ts) {
                this.history.push(this.buffer[i]);
                i++;
            }

            const minTs = ts - this.conf.history;
            const newHistoryStartIdx = this.history.findIndex(kf => kf.ts >= minTs);
            this.history.splice(0, newHistoryStartIdx);
        }

        const intpArity = this.conf.intpArity;
        let kfsChanged = false;
        while (this.buffer[intpArity - 1].ts < ts && this.buffer.length > intpArity) {
            const delCount = Math.min(
                intpArity - 1,
                this.buffer.length - intpArity
            );
            kfsChanged = true;

            this.buffer.splice(0, delCount);
        }

        if (this.buffer[intpArity - 1].ts < ts) return null;

        const data = {};
        const getSigSetKf = (cid, kf) => ({ts: kf.ts, data: kf.data[cid]});
        for (const sigSet of this.sigSets) {
            if (kfsChanged || !sigSet.intp.hasCachedArgs) {
                const sigSetBuffer = [];
                for (let i = 0; i < intpArity; i++) {
                    sigSetBuffer.push(getSigSetKf(sigSet.cid, this.buffer[i]));
                }

                sigSet.intp.rebuildArgs(sigSetBuffer);
            }

            const currentData = sigSet.intp.interpolate(ts);
            if (this.conf.history) {
                const sigSetHistory = this.history.map(kf => getSigSetKf(sigSet.cid, kf));
                sigSetHistory.push({ts, data: currentData});
                data[sigSet.cid] = sigSetHistory;
            } else {
                data[sigSet.cid] = currentData;
            }
        }

        return data;
    }
}


/**
 * TimeSeriesDataSource manages data for components based on TimeBasedChartBase.
 *
 * @param {object} config - Configuration object of the Data source.
 * @param {{cid: string, signalCids: string[]}[]} config.sigSets - Signal sets to be animated.
 * @param {string[]} [config.singnalAggs = ['avg']] - Aggregation functions that should
    * be animated for each signal.
 * @param {{func: function, arity: number}} config.interpolation - Interpolation function to be used.
 * @param {function} config.formatData - Formats data before the Data source stores
    * them. The function is given all the data MAI is generating
    * (`animationStatus.data`), the result is stored as a keyframe.
 * @param {object} dataAccess - 'Parent' instance of {@link AnimationDataAccess}.
 */
class TimeSeriesDataSource extends GenericDataSource{
    constructor(config, dataAccess) {
        super({...config}, dataAccess);

        this.lastGenDataRev = [];
    }

    /**
     * TimeSeriesDataSource's visualization data.
     *
     * @typedef {object} TimeSeriesVisualizationData
     *
     * @prop {object} signalSetCid - Visualization data for the give signal set.
        * Note: the property's name is only descriptive - not literal.
     * @prop {TimeSeriesKeyframe} signalSetCid.prev - Data measured before the currently viewed
        * interval.
     * @prop {TimeSeriesKeyframe[]} signalSetCid.main - Data measured inside the currently viewed
        * interval.
     * @prop {TimeSeriesKeyframe} signalSetCid.next - Data measured after the currently viewed
        * interval.
     */
    /**
     * TimeSeriesDataSource's keyframe data. Note that the properties' names are
     * only descriptive and not the actual keys.
     *
     * @typedef {object} TimeSeriesKeyframe
     *
     * @prop {moment} ts - Timestamp of the keyframe.
     * @prop {object} signalCid - Aggragations of the given signal
        * to be visualized.
     * @prop {number} signalCid.aggFuncName - Value of the given
        * aggregation function to be visualized.
     */
    /**
     * Generates visualization data.
     *
     * @param {number} ts - Unix timestamp for which to generate visualization
        * data.
     * @returns {TimeSeriesVisualizationData} - Visualization data generated by the Data
        * source.
     */
    shiftTo(ts) {
        const prevs = this._getPrevs();

        const absIntv = this.dataAccess.getIntervalAbsolute();
        this.conf.history = absIntv.to.valueOf() - absIntv.from.valueOf();

        const genericData = super.shiftTo(ts);

        if (genericData === null) return null;

        const tsToMoment = (kf) => {
            kf.ts = moment(kf.ts);
            return kf;
        };

        const data = {};
        for (const sigSet of this.sigSets) {
            data[sigSet.cid] = {
                main: genericData[sigSet.cid].map(tsToMoment),
            };

            if (prevs) {
                data[sigSet.cid].prev = prevs[sigSet.cid];
            }
        }

        return data;
    }

    getEmptyData() {
        const emptyData = {};
        for (const sigSet of this.sigSets) {
            emptyData[sigSet.cid] = { main: [] };
        }

        return emptyData;
    }

    _getPrevs(ts) {
        const findPrevIdx = arr => {
            let i = 0;
            while (i < arr.length && arr[i].ts <= ts) i++;

            if (i === arr.length || i === 0) return null;
            else return i-1;
        };

        let prevIdx = findPrevIdx(this.history);
        let arr = this.history;
        if (prevIdx === null) {
            prevIdx = findPrevIdx(this.buffer);
            arr = this.buffer;
        }

        let prevs = null;
        if (prevIdx !== null) {
            prevs = {};
            for (const sigSet of this.sigSets) {
                prevs[sigSet.cid] = arr[prevIdx].data[sigSet.cid];
            }
        }

        return prevs;
    }
}

/**
 * Defines available Data sources.
 *
 * @prop {object} generic - {@link GenericDataSource}.
 * @prop {object} timeSeries - {@link TimeSeriesDataSource}.
 */
const dataSourceTypes = {
    generic: GenericDataSource,
    timeSeries: TimeSeriesDataSource,
};


/**
 * Provides high-level data operations to {@link Animation}.
 *
 * @param {object} props
 * @param {object} props.dataSources - Data sources' configuration.
 * @param {object} props.dataSources.dataSourceKey - Configuration of the
    * Data source with the given key. Note: `dataSourceKey` only stands for the
    * actual Data source's key. This object is passed to the constructor of the
    * configured Data source's type as `config`.
 * @param {string} props.dataSources.dataSourceKey.type - Type of the Data
    * source to configure. The types are keys of the {@link dataSourceTypes} constant.
 */
@withComponentMixins([intervalAccessMixin()])
class AnimationDataAccess extends Component {
    static propTypes = {
        dataSources: PropTypes.object.isRequired,
        render: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            addKeyframe: ::this.addKeyframe,
            clearKeyframes: ::this.clearKeyframes,
            shiftTo: ::this.shiftTo,
            getEmptyData: ::this.getEmptyData,

            dataSources: props.dataSources,
        };

        this.resetDataSources();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props.dataSources, prevProps.dataSources)) {
            this.resetDataSources();
            this.setState({dataSources: this.props.dataSources});
        }
    }

    /**
      * Adds keyframe to animate.
      * @param {object} kf - MAI's generated data.
    */
    addKeyframe(kf) {
        for (const dtSrcKey of Object.keys(this.dataSources)) {
            this.dataSources[dtSrcKey].addKeyframe(kf);
        }
    }

    /**
      * Deletes all known keyframes.
      */
    clearKeyframes() {
        for (const dtSrcKey of Object.keys(this.dataSources)) {
            this.dataSources[dtSrcKey].clear();
        }
    }

    /**
     * Updates the visualization data to the given timestamp.
     *
     * @param {number} ts - Unix timestamp of the next frame.
     */
    shiftTo(ts) {
        const data = {};
        for (const dtSrcKey of Object.keys(this.dataSources)) {
            data[dtSrcKey] = this.dataSources[dtSrcKey].shiftTo(ts);
            if (data[dtSrcKey] === null) return null;
        }

        return data;
    }

    getEmptyData() {
        const data = {};
        for (const dtSrcKey of Object.keys(this.dataSources)) {
            data[dtSrcKey] = this.dataSources[dtSrcKey].getEmptyData();
        }

        return data;
    }

    resetDataSources() {
        this.dataSources = {};
        const dtSourceConfigs = this.props.dataSources;
        for (const dtSrcKey of Object.keys(dtSourceConfigs)) {
            const config = dtSourceConfigs[dtSrcKey];
            const DataSourceType = dataSourceTypes[config.type];

            this.dataSources[dtSrcKey] = new DataSourceType(config, this);
        }
    }

    render() {
        return this.props.render({...this.state});
    }
}


/**
 * Manages Live animation. Provides:
 * [AnimationDataContext](./AnimationCommon.md#animationdatacontext),
 * [AnimationStatusContext](./AnimationCommon.md#animationstatuscontext),
 * [AnimationControlContext](./AnimationCommon.md#animationcontrolcontext),
 *
 * @param {object} props
 * @param {string} props.animationId - identifier of the MAI to synchronize
    * with.
 * @param {moment.duration} props.intervalSpanBefore - Interval defining the
    * span between the left boundary of the viewed interval and the playback
    * position. ([moment.duration](https://momentjs.com/docs/#/durations/))
 * @param {moment.duration} props.intervalSpanAfter - Interval defining the
    * span between the playback position and the right boundary of the viewed
    * interval. ([moment.duration](https://momentjs.com/docs/#/durations/))
 * @param {number} props.pollRate - Number of milliseconds between
    * subsequent polls of the MAI.
 * @param {object} props.initialStatus - Initial animation's state.
 * @param {boolean} props.initialStatus.isPlaying - `true` if the
    * animation should start playing once initialized, `false` otherwise.
 * @param {function} props.addKeyframe - Adds keyframe to animate.
 * @param {function} props.clearKeyframes - Clears existing animated keyframes.
 * @param {function} props.shiftTo - Obtains visualization data for a given timestamp.
 * @param {function} props.getEmptyData - Obtains empty visualization data.
 */
@withComponentMixins([intervalAccessMixin()])
class Animation extends Component {
    static propTypes = {
        pollRate: PropTypes.number.isRequired,
        animationId: PropTypes.string.isRequired,

        initialStatus: PropTypes.object.isRequired,

        intervalSpanBefore: PropTypes.object.isRequired,
        intervalSpanAfter: PropTypes.object.isRequired,

        addKeyframe: PropTypes.func.isRequired,
        clearKeyframes: PropTypes.func.isRequired,
        shiftTo: PropTypes.func.isRequired,
        getEmptyData: PropTypes.func.isRequired,

        dataSources: PropTypes.object.isRequired,

        children: PropTypes.node,
    }

    constructor(props) {
        super(props);

        this.state = {
            status: this.getInitStatus(),
            controls: {
                play: ::this.play,
                pause: ::this.pause
            },
            animationData: props.getEmptyData(),
        };
        this.isRefreshing = false;
        this.refreshBound = ::this.refresh;
    }

    componentDidUpdate(prevProps) {
        if (this.props.pollRate !== prevProps.pollRate) {
            clearInterval(this.fetchStatusInterval);
            this.fetchStatusInterval = setInterval(::this.fetchStatus, this.props.pollRate);
        }

        if (this.props.animationId !== prevProps.animationId ||
            this.props.dataSources !== prevProps.dataSources) {
            this.masterReset();
        }

        if (this.props.intervalSpanBefore.asMilliseconds() !== prevProps.intervalSpanBefore.asMilliseconds()||
            this.props.intervalSpanAfter.asMilliseconds() !== prevProps.intervalSpanAfter.asMilliseconds()) {
            this.updateInterval();
        }
    }

    componentDidMount() {
        if (this.state.status.isPlaying) this.play();
        this.fetchStatusInterval = setInterval(::this.fetchStatus, this.props.pollRate);
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.nextFrameId);
        clearInterval(this.fetchStatusInterval);
    }

    masterReset() {
        this.pause();

        const initStatus = this.getInitStatus();
        this.setStatus(initStatus);
        if (initStatus.isPlaying) {
            this.play();
        }

        this.props.clearKeyframes();
        this.setState({animationData: this.props.getEmptyData()});
    }

    errorHandler(error) {
        console.error(error);

        cancelAnimationFrame(this.nextFrameId);
        clearInterval(this.fetchStatusInterval);
        this.setState({controls: {}});
        this.setStatus({error});

        return true;
    }

    getInitStatus() {
        const initialStatus = this.props.initialStatus;

        const newStatus = {
            isBuffering: false,
            isPlaying: !!initialStatus.isPlaying,
            position: Date.now(),
            playbackSpeedFactor: 1,
        };

        return newStatus;
    }

    updateInterval(currentPosition = this.state.status.position) {
        const from = moment(currentPosition - this.props.intervalSpanBefore.asMilliseconds());
        const to = moment(currentPosition + this.props.intervalSpanAfter.asMilliseconds());
        const newSpec = new IntervalSpec(
            from,
            to,
            null,
            null
        );

        this.getInterval().setSpec(newSpec, true);
    }

    handleNewStatus(newStatus) {
        const nextStatus = {};

        if (newStatus.isPlaying && !this.isRefreshing) {
            nextStatus.position = newStatus.position;
            this.handlePlay(nextStatus);
        } else if (!newStatus && this.isRefreshing) {
            this.handlePause(nextStatus);
        }

        if (newStatus.isPlaying) {
            const keyframe = { data: newStatus.data, ts: newStatus.position};

            this.props.addKeyframe(keyframe);
        }

        if (Object.keys(nextStatus).length > 0) {
            this.setStatus(nextStatus);
        }
    }

    setStatus(status) {
        this.setState((prevState) => {
            const newStatus = Object.assign({}, prevState.status, status);
            if (newStatus.position !== prevState.status.position) {
                this.updateInterval(newStatus.position);
            }

            return {status: newStatus};
        });
    }


    /**
     * The update-draw cycle of the animation.
     * @param {DOMHighResTimeStamp} elapsedTs - The timestamp of the next
        * repaint.
     */
    refresh(elapsedTs) {
        const interval = this.savedInterval || elapsedTs - this.lastRefreshTs;
        this.savedInterval = null;

        this.lastRefreshTs = performance.now();
        const nextPosition = this.state.status.position + interval;

        const data = this.props.shiftTo(nextPosition);

        if (data === null) {
            this.savedInterval = interval;
            if (!this.state.status.isBuffering)
                this.setStatus({isBuffering: true});
        } else {
            this.setState({animationData: data});
            this.setStatus({position: nextPosition, isBuffering: false});
        }

        this.nextFrameId = requestAnimationFrame(this.refreshBound);
    }

    handlePlay(nextStatus = {}) {
        if (this.isRefreshing) return nextStatus;

        this.isRefreshing = true;
        nextStatus.isPlaying = true;
        nextStatus.isBuffering = true;

        this.props.clearKeyframes();

        this.lastRefreshTs = performance.now();
        this.nextFrameId = requestAnimationFrame(::this.refresh);

        return nextStatus;
    }

    handlePause(nextStatus = {}) {
        this.isRefreshing = false;

        cancelAnimationFrame(this.nextFrameId);
        nextStatus.isPlaying = false;
        nextStatus.isBuffering = false;

        return nextStatus;
    }


    /**
     * Implements the `play` control function.
    */
    play() {
        this.setStatus({isPlaying: true, isBuffering: true});
        this.sendControlRequest("play");
    }

    /**
     * Implements the `pause` control function.
    */
    pause() {
        this.setStatus(this.handlePause());
        this.sendControlRequest("pause");
    }

    /**
     * Forwards requests to the MAI.
     * @param {string} controlName - Name of the control. Ex.: 'play' or 'pause.
     */
    @withAsyncErrorHandler
    async sendControlRequest(controlName) {
        const url = getUrl("rest/animation/" + this.props.animationId + "/" + controlName);
        const ctrlPromise = axios.post(url);

        this.fetchStatus();

        await ctrlPromise;
    }

    /**
     * Requests and then processes MAI's animation state.
     */
    @withAsyncErrorHandler
    async fetchStatus() {
        const animationId = this.props.animationId;
        const url = getUrl("rest/animation/" + animationId + "/status");
        const res = await axios.get(url);

        if (this.props.animationId === animationId) {
            this.handleNewStatus(res.data);
        }
    }

    render() {
        return (
            <AnimationStatusContext.Provider value={this.state.status}>
                <AnimationControlContext.Provider value={this.state.controls}>
                    <AnimationDataContext.Provider value={this.state.animationData}>
                        {this.props.children}
                    </AnimationDataContext.Provider>
                </AnimationControlContext.Provider>
            </AnimationStatusContext.Provider>
        );
    }
}

export {
    LiveAnimation
};

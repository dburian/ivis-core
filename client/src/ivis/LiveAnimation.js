import React, {Component} from "react";
import axios from "../lib/axios";
import {getUrl} from "../lib/urls";
import PropTypes from "prop-types";
import {
    AnimationStatusContext,
    AnimationControlContext,
    AnimationDataContext,
    SignalInterpolator
} from "../lib/animation-helpers";
import {withAsyncErrorHandler} from "../lib/error-handling";
import {withComponentMixins} from "../lib/decorator-helpers";
import {intervalAccessMixin, TimeContext} from "./TimeContext";
import {IntervalSpec} from "./TimeInterval";
import moment from "moment";
import _ from "lodash";

const defaultRefreshRate = 45;
const minRefreshRate = 5;
const defaultPollRate = 1000;
const minPollRate = 50;

class LiveAnimation extends Component {
    static propTypes = {
        dataSources: PropTypes.object.isRequired,
        animationId: PropTypes.string.isRequired,

        intervalSpanBefore: PropTypes.object,
        intervalSpanAfter: PropTypes.object,

        refreshRate: PropTypes.number,
        initialStatus: PropTypes.object,

        pollRate: PropTypes.number,

        children: PropTypes.node,
    }

    static defaultProps = {
        intervalSpanBefore: moment.duration(10, 'm'),
        intervalSpanAfter: moment.duration(3, 'm'),

        refreshRate: defaultRefreshRate,
        pollRate: defaultPollRate,
        initialStatus: {isPlaying: false},
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
        const refreshRate = this.props.refreshRate === null || Number.isNaN(this.props.refreshRate) ?
            minRefreshRate :
            Math.max(minRefreshRate, this.props.refreshRate)
        ;
        const pollRate = this.props.pollRate === null || Number.isNaN(this.props.pollRate) ?
            minPollRate :
            Math.max(minPollRate, this.props.pollRate)
        ;


        const childrenRender = (props) => {
            return (
                <LiveAnimationControl
                    animationId={this.props.animationId}
                    pollRate={pollRate}

                    intervalSpanBefore={this.props.intervalSpanBefore}
                    intervalSpanAfter={this.props.intervalSpanAfter}

                    refreshRate={refreshRate}
                    initialStatus={this.props.initialStatus}
                    {...props}>
                    {this.props.children}
                </LiveAnimationControl>
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

class GenericDataSource {
    constructor(config, dataAccess) {
        this.conf = {...config};
        this.dataAccess = dataAccess;

        this.intp = new SignalInterpolator(
            this.conf.signals,
            this.conf.interpolation.func,
            this.conf.interpolation.arity
        );

        this.clear();
    }

    addKeyframe(kf) {
        const data = this.conf.formatData ? this.conf.formatData(kf.data) : kf.data;
        this.kfBuffer.push({ts: kf.ts, data});
    }

    clear() {
        this.history = [];
        this.kfBuffer = [];
        this.intp.clearArgs();
        this.lastShiftNull = true;
        this.kfPillow = 0;
    }

    shiftTo(ts) {
        let minKfCount = this.conf.interpolation.arity;

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
        if (this.kfBuffer.length < minKfCount) return null;

        if (this.conf.withHistory) {
            const historyLastTs = this.history.length > 0 ? this.history[this.history.length - 1].ts : -1;
            const kfsToHistory = this.kfBuffer.filter(kf => kf.ts < ts && kf.ts > historyLastTs);
            this.history.push(...kfsToHistory);

            const minTs = this.dataAccess.getIntervalAbsolute().from.valueOf();
            const newHistoryStartIdx = this.history.findIndex(kf => kf.ts >= minTs);
            this.history.splice(0, newHistoryStartIdx);
        }

        const intpArity = this.conf.interpolation.arity;
        let kfsChanged = false;
        while (this.kfBuffer[intpArity - 1].ts < ts && this.kfBuffer.length > intpArity) {
            const delCount = Math.min(
                intpArity - 1,
                this.kfBuffer.length - intpArity
            );
            kfsChanged = true;

            this.kfBuffer.splice(0, delCount);
        }

        if (this.kfBuffer[intpArity - 1].ts < ts) return null;

        if (kfsChanged || !this.intp.hasCachedArgs) this.intp.rebuildArgs(this.kfBuffer);

        if (this.conf.withHistory) {
            return [...this.history, {ts: ts, data: this.intp.interpolate(ts)}];
        } else {
            return this.intp.interpolate(ts);
        }
    }

    getEmptyData() {
        return this.conf.withHistory ? [] : this.intp.interpolate(-1);
    }
}

class TimeSeriesDataSource extends GenericDataSource{
    constructor(config, dataAccess) {
        super({...config, withHistory: true}, dataAccess);

        this.lastGenDataRev = [];
    }

    shiftTo(ts) {
        const genericData = super.shiftTo(ts);
        if (genericData === null) return null;

        const tsToMoment = (kf) => ({ts: moment(kf.ts), data: kf.data});

        const data = {
            main: genericData.map(tsToMoment),
        };

        const mainStartTs = this.dataAccess.getIntervalAbsolute().from.valueOf();
        const prevIdx = this.lastGenDataRev.findIndex(kf => kf.ts < mainStartTs);

        if (prevIdx > -1) {
            data.prev = tsToMoment(this.lastGenDataRev[prevIdx]);
            this.lastGenDataRev = [this.lastGenDataRev[prevIdx], ...genericData];
        } else {
            this.lastGenDataRev = genericData;
        }

        this.lastGenDataRev.reverse();
        return {[this.conf.sigSetCid]: data};
    }

    getEmptyData() {
        return {
            [this.conf.sigSetCid]: { main: [] }
        };
    }
}

const dataSourceTypes = {
    generic: GenericDataSource,
    timeSeries: TimeSeriesDataSource,
};

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

    addKeyframe(kf) {
        for (const dtSrcKey of Object.keys(this.dataSources)) {
            this.dataSources[dtSrcKey].addKeyframe(kf);
        }
    }

    clearKeyframes() {
        for (const dtSrcKey of Object.keys(this.dataSources)) {
            this.dataSources[dtSrcKey].clear();
        }
    }

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

@withComponentMixins([intervalAccessMixin()])
class LiveAnimationControl extends Component {
    static propTypes = {
        pollRate: PropTypes.number.isRequired,
        animationId: PropTypes.string.isRequired,

        refreshRate: PropTypes.number.isRequired,
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
        this.lastStatus = {};
        this.isRefreshing = false;
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
        clearTimeout(this.refreshTimeout);
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

        clearTimeout(this.refreshTimeout);
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

        if (newStatus.isPlaying !== this.lastStatus.isPlaying) {
            if (newStatus.isPlaying && !this.isRefreshing) {
                nextStatus.position = newStatus.position;
                this.handlePlay(nextStatus);
            } else if (!newStatus && this.isRefreshing) {
                this.handlePause(nextStatus);
            }
        }

        if (this.isRefreshing) {
            const keyframe = { data: newStatus.data, ts: newStatus.position};

            this.props.addKeyframe(keyframe);
        }

        if (Object.keys(nextStatus).length > 0) {
            this.setStatus(nextStatus);
        }

        this.lastStatus = newStatus;
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


    refresh() {
        let nextPosition;
        if (this.savedPosition) {
            nextPosition = this.savedPosition;
            this.savedPosition = null;
        } else {
            nextPosition = this.lastRefreshTs === null ?
                this.state.status.position :
                this.state.status.position + (Date.now() - this.lastRefreshTs);
        }
        this.lastRefreshTs = Date.now();

        const data = this.props.shiftTo(nextPosition);

        if (data === null) {
            this.savedPosition = nextPosition;
            this.setStatus({isBuffering: true});
        } else {
            this.setState({animationData: data});
            this.setStatus({position: nextPosition, isBuffering: false});
        }

        this.refreshTimeout = setTimeout(::this.refresh, Math.max(0, this.props.refreshRate - (Date.now() - this.lastRefreshTs)));
    }

    handlePlay(nextStatus = {}) {
        if (this.isRefreshing) return nextStatus;

        this.isRefreshing = true;
        nextStatus.isPlaying = true;
        nextStatus.isBuffering = true;

        this.props.clearKeyframes();

        this.savedPosition = null;
        this.lastRefreshTs = null;
        this.refreshTimeout = setTimeout(::this.refresh, this.props.refreshRate);

        return nextStatus;
    }

    handlePause(nextStatus = {}) {
        this.isRefreshing = false;

        clearTimeout(this.refreshTimeout);
        nextStatus.isPlaying = false;
        nextStatus.isBuffering = false;

        return nextStatus;
    }


    play() {
        this.setStatus({isPlaying: true, isBuffering: true});
        this.sendControlRequest("play");
    }

    pause() {
        this.setStatus(this.handlePause());
        this.sendControlRequest("pause");
    }

    @withAsyncErrorHandler
    async sendControlRequest(controlName) {
        const url = getUrl("rest/animation/" + this.props.animationId + "/" + controlName);
        const ctrlPromise = axios.post(url);

        this.fetchStatus();

        await ctrlPromise;
    }

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

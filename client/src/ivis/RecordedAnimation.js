import React, {Component} from "react";
import {
    AnimationStatusContext,
    AnimationControlContext,
    AnimationDataContext,
    SignalInterpolator
} from "../lib/animation-helpers";
import {withAsyncErrorHandler} from "../lib/error-handling";
import {DataAccessSession} from "./DataAccess";
import {withComponentMixins} from "../lib/decorator-helpers";
import {intervalAccessMixin, TimeContext} from "./TimeContext";
import {IntervalSpec} from "./TimeInterval";
import {bisector} from "d3-array";
import moment from "moment";
import _ from "lodash";
import PropTypes from "prop-types";


//When the tab is inactive, setIntervals and setTimeouts that are scheduled within less than 1s are triggered after
//1s. This means that we want to store at least 1s of keyframes ahead of the
//current position.
const minTimeLoadedAhead = 1000;

const defaultMaxLoadAheadMs = 30000;
const defaultMinFramesPerKeyframe = 5;
const defaultRefreshRate = 45;
const minRefreshRate = 5;


class RecordedAnimation extends Component {
    static propTypes = {
        dataSources: PropTypes.object.isRequired,

        initialIntervalSpec: PropTypes.object,
        intervalConfigPath: PropTypes.arrayOf(PropTypes.string),
        defaultGetMinAggregationInterval: PropTypes.func,

        initialStatus: PropTypes.object,
        refreshRate: PropTypes.number,

        children: PropTypes.node,
    }

    static defaultProps = {
        initialIntervalSpec: new IntervalSpec('now-6d', 'now', null, null),
        intervalConfigPath: ['animationTimeContext'],
        refreshRate: defaultRefreshRate,
        initialStatus: {
            isPlaying: false,
            playbackSpeedFactor: 1,
            position: null,
        },
    }

    render() {
        const childrenRender = (props) => {
            return (
                <RecordedAnimationControl
                    refreshRate={this.props.refreshRate}
                    initialStatus={this.props.initialStatus}
                    {...props}
                >
                    {this.props.children}
                </RecordedAnimationControl>
            );
        };
        const refreshRate = this.props.refreshRate === null || Number.isNaN(this.props.refreshRate) ?
            minRefreshRate :
            Math.max(minRefreshRate, this.props.refreshRate)
        ;

        return (
            <TimeContext
                initialIntervalSpec={this.props.initialIntervalSpec}
                configPath={this.props.intervalConfigPath}
                getMinAggregationInterval={this.props.defaultGetMinAggregationInterval}
            >

                <AnimationDataAccess
                    refreshRate={refreshRate}

                    dataSources={this.props.dataSources}
                    render={childrenRender}
                />
            </TimeContext>
        );
    }
}

class GenericDataSource {
    constructor(config, dataAccess) {
        this.dataAccess = dataAccess;

        const parseConfig = () => {
            const conf = {
                sigSetCid: config.sigSetCid,
                tsSigCid: config.tsSigCid,
                signals: config.signals,

                kfCount: config.interpolation.arity,

                maxLoadAheadMs: config.maxLoadAheadMs || defaultMaxLoadAheadMs,
                minFramesPerKeyframe: config.minFramesPerKeyframe || defaultMinFramesPerKeyframe,

                withHistory: config.withHistory || false,
            };

            let getAggStep = null;
            if (conf.withHistory) {
                getAggStep = () => this.dataAccess.getIntervalAbsolute().aggregationInterval;
            } else {
                getAggStep = () => this.dataAccess.getPlaybackSpeedFactorBasedAggStep(conf.minFramesPerKeyframe);
            }

            const getAggOffset = (aggStep) => moment.duration(this.dataAccess.getIntervalAbsolute().from.valueOf() % aggStep.asMilliseconds());

            conf.getAggStep = getAggStep;
            conf.getAggOffset = getAggOffset;

            return conf;
        };

        this.conf = parseConfig();

        this.kfBuffer = [];
        this.history = [];
        this.missedFetches = 1;

        this.nextChunkBeginTs = null;

        this.intp = new SignalInterpolator(this.conf.signals, config.interpolation.func, this.conf.kfCount);
    }

    canShiftTo(ts) {
        return !this.hasMoreData || this.kfBuffer[this.kfBuffer.length - 1].ts >= ts;
    }

    shiftTo(ts) {
        if (this.conf.withHistory) {
            const historyLastTs = this.history.length > 0 ? this.history[this.history.length - 1].ts : this.dataAccess.getIntervalAbsolute().from.valueOf() - 1;
            const kfsToHistory = this.kfBuffer.filter(kf => kf.ts < ts && kf.ts > historyLastTs);
            this.history.push(...kfsToHistory);
        }

        if (this.kfBuffer.length < this.conf.kfCount) {
            while (this.kfBuffer.length > 0 && this.kfBuffer[0].ts < ts)
                this.kfBuffer.shift();

            this.intp.rebuildArgs(this.kfBuffer);

        } else if (this.kfBuffer[this.kfBuffer.length - 1].ts < ts) {
            this.kfBuffer = [];

            this.intp.rebuildArgs(this.kfBuffer);

        } else if (this.kfBuffer[this.conf.kfCount - 1].ts < ts) {
            while (this.kfBuffer[this.conf.kfCount - 1].ts < ts) {
                const newBeginIdx = Math.min(
                    this.kfBuffer.length - this.conf.kfCount,
                    this.conf.kfCount - 1
                );

                this.kfBuffer = this.kfBuffer.slice(newBeginIdx);
            }

            this.intp.rebuildArgs(this.kfBuffer);
        } else if (!this.intp.hasCachedArgs) {
            this.intp.rebuildArgs(this.kfBuffer);
        }

        if (this.conf.withHistory) {
            return [...this.history, {ts, data: this.intp.interpolate(ts)}];
        } else {
            return this.intp.interpolate(ts);
        }
    }

    getEmptyData() {
        if (this.conf.withHistory) {
            return [];
        } else {
            return this.intp.interpolate(-1);
        }
    }

    didMissFetch() {
        this.missedFetches += 1;
    }
    hasEnoughLoaded(maxPredictedFetchTime) {
        const kfBuffer = this.kfBuffer;
        const storedTime = kfBuffer.length <= 2*this.conf.kfCount ? 0 : kfBuffer[kfBuffer.length - 1].ts - kfBuffer[2*this.conf.kfCount].ts;

        return !this.hasMoreData || (storedTime - minTimeLoadedAhead) / this.dataAccess.playbackSpeedFactor > this.missedFetches * maxPredictedFetchTime;
    }

    getSeekQueries(ts) {
        const queries = [];

        this.nextChunkBeginTs = ts;
        this.nextKeyframeCount = 2*this.conf.kfCount;

        if (this.conf.withHistory) queries.push(this._getHistoryQuery());
        queries.push(this._getFirstKeyframeQuery());
        queries.push(this._getNextKeyframesQuery());

        return queries;
    }
    processSeekQueries(qryResults) {
        this.hasMoreData = true;
        this.intp.clearArgs();

        const realKeyframeCount = qryResults[qryResults.length - 1][0].buckets.length;
        if (realKeyframeCount < this.nextKeyframeCount) {
            this.hasMoreData = false;
        }

        if (this.conf.withHistory) {
            const historyRes = qryResults.shift()[0].buckets;
            this.history = this._processHistory(historyRes);
        }

        let keyframesRes = [].concat(...qryResults.map(result => result[0].buckets));
        this.kfBuffer = this._processKeyframes(keyframesRes);
    }

    getNextChunkQueries() {
        return [ this._getNextKeyframesQuery() ];
    }
    processNextChunkQueries(qryResults) {
        const buckets = qryResults[0][0].buckets;
        if (buckets.length < this.nextKeyframeCount) {
            this.hasMoreData = false;
        }

        let keyframes = this._processKeyframes(buckets);


        //Due to aggregation intervals behaviour, we sometimes get a kf twice
        const lastKfBufferTs = this.kfBuffer.length > 0 ? this.kfBuffer[this.kfBuffer.length - 1].ts : -1;
        this.kfBuffer.push(...keyframes.filter(kf => kf.ts > lastKfBufferTs));
    }

    _processKeyframes(buckets) {
        const kfs = this._procesBuckets(buckets);

        this.nextChunkBeginTs = kfs.length > 0 ? kfs[kfs.length - 1].ts : this.nextChunkBeginTs;

        const timeFetched = kfs.length <= 1 ? 0 : kfs[kfs.length - 1].ts - kfs[0].ts;
        if (timeFetched / this.dataAccess.playbackSpeedFactor < this.conf.maxLoadAheadMs) {
            this.nextKeyframeCount = this.nextKeyframeCount * 2;
        }

        return kfs;
    }
    _processHistory(buckets) {
        return this._procesBuckets(buckets);
    }
    _procesBuckets(buckets) {
        const formattedBuckets = [];

        for (const bucket of buckets) {
            const ts = moment(bucket.key).valueOf();
            const data = bucket.values;

            formattedBuckets.push({ ts, data});
        }

        return formattedBuckets;
    }

    _getNextKeyframesQuery() {
        return {
            type: "aggs",
            args: [
                this.conf.sigSetCid,
                {
                    type: "range",
                    sigCid: this.conf.tsSigCid,
                    gt: moment(this.nextChunkBeginTs).toISOString(),
                },
                this._getQueryAggs(this.nextKeyframeCount, "asc")
            ]
        };
    }
    _getFirstKeyframeQuery() {
        return {
            type: "aggs",
            args: [
                this.conf.sigSetCid,
                {
                    type: "range",
                    sigCid: this.conf.tsSigCid,
                    lte: moment(this.nextChunkBeginTs).toISOString(),
                },
                this._getQueryAggs(1, "desc")
            ]
        };
    }
    _getHistoryQuery() {
        return {
            type: "aggs",
            args: [
                this.conf.sigSetCid,
                {
                    type: "range",
                    sigCid: this.conf.tsSigCid,
                    lt: moment(this.nextChunkBeginTs).toISOString(),
                    gte: this.dataAccess.getIntervalAbsolute().from.toISOString(),
                },
                this._getQueryAggs(null, 'asc')
            ]
        };
    }

    _getQueryAggs(limit, order) {
        const step = this.conf.getAggStep();
        const offset = this.conf.getAggOffset(step);

        return [
            {
                sigCid: this.conf.tsSigCid,
                step: step.toString(),
                offset: offset.toString(),
                minDocCount: 1,
                signals: this.conf.signals,
                limit,
                order,
            }
        ] ;
    }
}

class TimeSeriesDataSource {
    constructor(config, dataAccess) {
        this.dataAccess = dataAccess;

        const parseConfig = () => {
            const conf = {
                sigSetCid: config.sigSetCid,
                tsSigCid: config.tsSigCid,
                signals: config.signals,

                kfCount: config.interpolation.arity,

                getAggStep: () => this.dataAccess.getIntervalAbsolute().aggregationInterval,
                getAggOffset: (aggStep) => moment.duration(this.dataAccess.getIntervalAbsolute().from.valueOf() % aggStep.asMilliseconds()),
            };

            return conf;
        };

        this.conf = parseConfig();
        this.data = null;
        this.kfStartIdx = null;
        this.intp = new SignalInterpolator(this.conf.signals, config.interpolation.func, this.conf.kfCount);

        this.lastSeekInterval = null;
    }

    canShiftTo() {
        return true;
    }

    shiftTo(ts) {
        const main = this.data.main;


        if (main.length === 0 || ts < main[0].ts.valueOf()) {
            return {
                [this.conf.sigSetCid]: { main: [] }
            };
        } else if (ts >= main[main.length - 1].ts.valueOf()) {
            const data = {
                main: this.data.main
            };

            if (this.data.prev) data.prev = this.data.prev;
            if (this.data.next) data.next = this.data.next;

            return {
                [this.conf.sigSetCid]: data
            };
        }

        const maxKfStartIdx = main.length - this.conf.kfCount;

        let mainEndIdx = Math.max(0, bisector((kf) => kf.ts.valueOf()).left(main, ts) - 1);

        if (this.kfStartIdx === null) {
            if (mainEndIdx > maxKfStartIdx) {
                this.kfStartIdx = maxKfStartIdx;
            } else {
                this.kfStartIdx = main[mainEndIdx + 1].ts.valueOf() === ts ? mainEndIdx + 1 : mainEndIdx;
            }

            this.intp.rebuildArgs(main.slice(this.kfStartIdx, this.kfStartIdx + this.conf.kfCount));

        } else if (main[this.kfStartIdx + this.conf.kfCount - 1].ts.valueOf() < ts) {
            while (main[this.kfStartIdx + this.conf.kfCount - 1].ts.valueOf() < ts) {
                this.kfStartIdx = Math.min(
                    maxKfStartIdx,
                    this.kfStartIdx + this.conf.kfCount - 1
                );
            }

            this.intp.rebuildArgs(main.slice(this.kfStartIdx, this.kfStartIdx + this.conf.kfCount));
        } else if (!this.intp.hasCachedArgs) {
            this.intp.rebuildArgs(main.slice(this.kfStartIdx, this.kfStartIdx + this.conf.kfCount));
        }

        const data = {
            main: main.slice(0, mainEndIdx + 1),
        };

        data.main.push({ts: moment(ts), data: this.intp.interpolate(ts)});

        if (this.data.prev) data.prev = this.data.prev;

        return {[this.conf.sigSetCid]: data};
    }

    getEmptyData() {
        return {
            [this.conf.sigSetCid]: {main: []}
        };
    }

    didMissFetch() {}
    hasEnoughLoaded() {
        return true;
    }

    getSeekQueries() {
        const intvAbs = this.dataAccess.getIntervalAbsolute();

        const sameAggregationInterval = () => {
            const prev = this.lastSeekInterval.aggregationInterval;
            const curr = intvAbs.aggregationInterval;

            return (prev === null && curr === null) || (prev !== null && curr !== null && prev.asMilliseconds() === curr.asMilliseconds());
        };

        if (this.lastSeekInterval &&
            this.lastSeekInterval.from === intvAbs.from.valueOf() &&
            this.lastSeekInterval.to === intvAbs.to.valueOf() &&
            sameAggregationInterval()) {

            return [];
        }

        const sigSets = {
            [this.conf.sigSetCid]: {
                tsSigCid: this.conf.tsSigCid,
                signals: this.conf.signals,
            },
        };

        const queries = [
            {
                type: "timeSeries",
                args: [ sigSets, intvAbs ]
            }
        ];

        return queries;
    }
    processSeekQueries(qryResults, queries) {
        this.kfStartIdx = null;
        this.intp.clearArgs();

        if (qryResults.length === 0) return;

        const intvAbs = queries[0].args[1];
        this.lastSeekInterval = {
            from: intvAbs.from.valueOf(),
            to: intvAbs.to.valueOf(),
            aggregationInterval: intvAbs.aggregationInterval
        };


        this.kfStartIdx = null;
        this.intp.clearArgs();

        this.data = qryResults[0][this.conf.sigSetCid];
    }

    getNextChunkQueries() {
        return [];
    }
    processNextChunkQueries() {}
}

const dataSources = {
    generic: GenericDataSource,
    timeSeries: TimeSeriesDataSource,
};

@withComponentMixins([intervalAccessMixin()])
class AnimationDataAccess extends Component {
    static propTypes = {
        refreshRate: PropTypes.number.isRequired,
        dataSources: PropTypes.object.isRequired,
        render: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            seek: ::this.seek,
            refreshTo: ::this.refreshTo,
            setPlaybackSpeedFactor: ::this.setPlaybackSpeedFactor,
            getEmptyData: ::this.getEmptyData,

            fetchError: null,
            needsReseek: false,
        };

        this.maxFetchTime = 0;

        this.mapDataSources = (func) => Object.keys(this.dataSources).map(dsKey => func(this.dataSources[dsKey], dsKey));
        this.reset();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(this.props.dataSources, prevProps.dataSources)) {
            this.reset();
            this.setState({needsReseek: true});
        }
    }

    async seek(ts) {
        if (this.state.needsReseek) this.setState({needsReseek: false});

        const wasLatestFetch = await this.runQueries(Object.keys(this.dataSources), "getSeekQueries", [ts], "processSeekQueries");

        if (!wasLatestFetch) return null;

        return this.shiftTo(ts);
    }

    refreshTo(ts) {
        if (this.state.needsReseek || this.nextFetchPromise) return {data: null};

        const dataSourcesToFetch = Object.keys(this.dataSources).filter(dataSrcKey => !this.dataSources[dataSrcKey].canShiftTo(ts));

        if (dataSourcesToFetch.length === 0) {
            return {data: this.shiftTo(ts)};
        }

        dataSourcesToFetch.map(dtSrcKey => this.dataSources[dtSrcKey].didMissFetch());
        this.runQueries(dataSourcesToFetch, "getNextChunkQueries", [], "processNextChunkQueries");
        const promise = this.nextFetchPromise.then(wasLatestFetch => {
            if (!wasLatestFetch) return null;

            return this.shiftTo(ts);
        });

        return {promise};
    }

    setPlaybackSpeedFactor(factor) {
        this.playbackSpeedFactor = factor;
    }

    getEmptyData() {
        const emptDt = {};
        for (const dtSrcKey of Object.keys(this.dataSources)) {
            emptDt[dtSrcKey] = this.dataSources[dtSrcKey].getEmptyData();
        }

        return emptDt;
    }


    async runQueries(dataSrcKeys, getQueriesFuncName, getQueriesFuncArgs, processQueriesFuncName) {
        const _runQueries = async () => {
            const lengths = [];
            const querySetOwners = [];
            const queries = [];

            for (const dataSrcKey of dataSrcKeys) {
                const querySet = this.dataSources[dataSrcKey][getQueriesFuncName](...getQueriesFuncArgs);
                queries.push(...querySet);
                lengths.push(querySet.length);
                querySetOwners.push(dataSrcKey);
            }

            const results = await this.dataAccSession.getLatestMixed(queries);

            if (results === null) return false;

            let i = 0;
            while (i < querySetOwners.length) {
                const owner = this.dataSources[querySetOwners[i]];
                const querySetLength = lengths[i];
                const resultSet = results.splice(0, querySetLength);
                const querySet = queries.splice(0, querySetLength);

                owner[processQueriesFuncName](resultSet, querySet);

                i++;
            }

            return true;
        };

        this.nextFetchPromise = _runQueries();
        const beforeFetchTs = Date.now();

        const wasLatestFetch = await this.nextFetchPromise;

        this.nextFetchPromise = null;
        this.maxFetchTime = Math.max(this.maxFetchTime, Date.now() - beforeFetchTs);

        return wasLatestFetch;
    }
    shiftTo(ts) {
        const data = {};

        for (const dataSrcKey of Object.keys(this.dataSources)) {
            data[dataSrcKey] = this.dataSources[dataSrcKey].shiftTo(ts);
        }

        this.startPreFetching();
        return data;
    }
    @withAsyncErrorHandler
    async startPreFetching() {
        if (this.state.needsReseek || this.nextFetchPromise) return;

        let needFetch = Object.keys(this.dataSources).filter(dataSrcKey => !this.dataSources[dataSrcKey].hasEnoughLoaded(this.maxFetchTime));
        while (needFetch.length > 0) {
            const wasLatestFetch = await this.runQueries(needFetch, "getNextChunkQueries", [], "processNextChunkQueries");

            if (!wasLatestFetch) return;

            needFetch = Object.keys(this.dataSources).filter(dataSrcKey => !this.dataSources[dataSrcKey].hasEnoughLoaded(this.maxFetchTime));
        }

    }

    errorHandler(error) {
        this.setState({fetchError: error, needsReseek: true});

        return true;
    }
    getPlaybackSpeedFactorBasedAggStep(minFramesPerKeyframe) {
        return moment.duration(minFramesPerKeyframe * this.props.refreshRate * this.playbackSpeedFactor);
    }

    reset() {
        this.dataAccSession = new DataAccessSession();
        this.nextFetchPromise = null;

        this.dataSources = {};
        for (const dataSrcKey of Object.keys(this.props.dataSources)) {
            const config = this.props.dataSources[dataSrcKey];
            const DataSourceType = dataSources[config.type] || "generic";

            this.dataSources[dataSrcKey] = new DataSourceType(config, this);
        }
    }

    render() {
        return this.props.render({...this.state});
    }
}

@withComponentMixins([intervalAccessMixin()])
class RecordedAnimationControl extends Component {
    static propTypes = {
        refreshRate: PropTypes.number.isRequired,
        initialStatus: PropTypes.object.isRequired,

        seek: PropTypes.func.isRequired,
        refreshTo: PropTypes.func.isRequired,
        setPlaybackSpeedFactor: PropTypes.func.isRequired,
        getEmptyData: PropTypes.func.isRequired,

        needsReseek: PropTypes.bool,

        fetchError: PropTypes.object,

        children: PropTypes.node,
    }

    constructor(props) {
        super(props);

        this.state = {
            status: this.resetStatus(false),
            controls: {
                play: ::this.playHandler,
                pause: ::this.pauseHandler,
                seek: ::this.seekHandler,
                stop: ::this.stopHandler,
                jumpForward: ::this.jumpForwardHandler,
                jumpBackward: ::this.jumpBackwardHandler,
                changeSpeed: ::this.changePlaybackSpeedHandler,
            },
            animationData: props.getEmptyData(),
        };

        this.refreshTimeout = null;
        this.inRefresh = false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.fetchError && !prevProps.fetchError) {
            this.errorHandler(this.props.fetchError);
            return;
        }

        const prevIntvSpec = this.getIntervalSpec(prevProps);
        const currIntvSpec = this.getIntervalSpec();
        const sameIntv = prevIntvSpec.from === currIntvSpec.from && prevIntvSpec.to === currIntvSpec.to;
        if (!sameIntv) {
            this.seekHandler(this.getIntervalAbsolute().from.valueOf());
        } else if (this.props.needsReseek && !prevProps.needsReseek) {
            this.seekHandler(this.state.status.position);
        }
    }

    componentWillUnmount() {
        this.stopRefreshing();
    }

    componentDidMount() {
        this.changePlaybackSpeedHandler(this.state.status.playbackSpeedFactor);
        this.seekHandler(this.state.status.position);

        if (this.state.status.isPlaying) this.playHandler();
    }

    resetStatus(withUpdate) {
        const is = this.props.initialStatus;
        const startingPos = is.position !== null && !Number.isNaN(is.position) ?
            this.clampPos(is.position) :
            this.getIntervalAbsolute().from.valueOf()
        ;

        let speedFactor = is.playbackSpeedFactor;
        if (speedFactor == undefined || Number.isNaN(speedFactor) || speedFactor <= 0) {
            speedFactor = 1;
        }


        const newStatus = {
            isBuffering: true,
            isPlaying: is.isPlaying,
            playbackSpeedFactor: speedFactor,
            position: startingPos,
        };

        if (withUpdate) {
            this.changePlaybackSpeedHandler(newStatus.playbackSpeedFactor);
            this.seekHandler(newStatus.position);

            if (newStatus.isPlaying) this.playHandler();
        }

        return newStatus;
    }

    clampPos(pos) {
        const minPosition = this.getIntervalAbsolute().from.valueOf();
        const maxPosition = this.getIntervalAbsolute().to.valueOf();
        return Math.min(maxPosition, Math.max(minPosition, pos));
    }


    errorHandler(error) {
        console.error(error);

        this.stopRefreshing();
        this.setState({controls: {}});
        this.setStatus({error});

        return true;
    }

    playHandler() {
        this.startRefreshing();
        this.setStatus({isPlaying: true});
    }

    pauseHandler() {
        this.stopRefreshing();
        this.setStatus({isPlaying: false});
    }

    stopHandler() {
        if (this.state.status.isPlaying) this.pauseHandler();
        this.seekHandler(this.getIntervalAbsolute().from.valueOf());
    }

    jumpForwardHandler(shiftMs) {
        this.seekHandler(this.state.status.position + shiftMs);
    }

    jumpBackwardHandler(shiftMs) {
        this.seekHandler(this.state.status.position - shiftMs);
    }

    changePlaybackSpeedHandler(factor) {
        this.props.setPlaybackSpeedFactor(factor);
        this.setStatus({playbackSpeedFactor: factor});
    }

    @withAsyncErrorHandler
    async seekHandler(ts) {
        const clampedTs = this.clampPos(ts);

        this.setStatus({position: clampedTs, isBuffering: true});

        const animData = await this.props.seek(clampedTs);

        if (animData !== null) {
            this.setState({animationData: animData});
            this.setStatus({isBuffering: this.state.status.isPlaying});
        }
    }


    @withAsyncErrorHandler
    async refresh() {
        this.inRefresh = true;

        const interval = Date.now() - this.lastRefreshTs;
        this.lastRefreshTs = Date.now();

        const endPosition = this.getIntervalAbsolute().to.valueOf();
        const nextPosition = Math.min(
            endPosition,
            this.state.status.position + (this.state.status.playbackSpeedFactor * interval)
        );


        let {data, promise} = this.props.refreshTo(nextPosition);

        if (promise) {
            if (!this.state.status.isBuffering)
                this.setStatus({isBuffering: true});

            data = await promise;
            this.lastRefreshTs = Date.now();
        }

        if (data !== null) {
            this.setStatus({
                isBuffering: false,
                position: nextPosition,
            });

            this.setState({
                animationData: data,
            });
        }


        if (nextPosition !== endPosition && this.isRefreshing) {
            const computeTime = Date.now() - this.lastRefreshTs;
            this.refreshTimeout = setTimeout(::this.refresh, Math.max(0, this.props.refreshRate - computeTime));
        } else {
            this.pauseHandler();
        }

        this.inRefresh = false;
    }

    startRefreshing() {
        if (this.isRefreshing) return;

        this.isRefreshing = true;
        if (this.inRefresh) return;

        this.lastRefreshTs = Date.now();
        this.refreshTimeout = setTimeout(::this.refresh, this.props.refreshRate);
    }

    stopRefreshing() {
        this.isRefreshing = false;
        clearTimeout(this.refreshTimeout);
    }

    setStatus(nextStatus) {
        this.setState(prevState => {
            const newStatus = Object.assign({}, prevState.status, nextStatus);

            return {status: newStatus};
        });
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
    RecordedAnimation
};

'use strict';

const moment = require('moment');
const elasticsearch = require('../elasticsearch');
const {SignalType, SignalSource} = require('../../../shared/signals');
const {getIndexName, getFieldName} = require('./elasticsearch-common');

const handlebars = require('handlebars');
const log = require('../log');

async function executeElsQry(index, body) {
    try {
        const result = await elasticsearch.search({
            index,
            body
        });

        return result;
    } catch (err) {
        log.error("Indexer", "Elasticsearch queries failed");
        log.verbose(err);
        throw new Error("Elasticsearch queries failed");
    }
}

// Converts an interval into elasticsearch interval
function getElsInterval(duration) {
    const units = ['ms', 's', 'm', 'h'];
    for (const unit of units) {
        if (duration.get(unit) !== 0) {
            //Rounding needed as duration.as(<unit>) returns float.
            //See the output of moment.duration('PT4.087').as('ms').
            return Math.round(duration.as(unit)) + unit;
        }
    }

    return duration.as('d') + 'd';
}

const aggHandlers = {
    min: aggSpec => ({
        id: 'min',
        getAgg: field => ({
            min: field
        }),
        processResponse: resp => resp.value
    }),
    avg: aggSpec => ({
        id: 'avg',
        getAgg: field => ({
            avg: field
        }),
        processResponse: resp => resp.value
    }),
    max: aggSpec => ({
        id: 'max',
        getAgg: field => ({
            max: field
        }),
        processResponse: resp => resp.value
    }),
    percentiles: aggSpec => ({
        id: 'percentiles',
        getAgg: field => ({
            percentiles: {
                percents: aggSpec.percents,
                ...field
            }
        }),
        processResponse: resp => resp.values
    }),
};

function getAggHandler(aggSpec) {
    let aggHandler;

    if (typeof aggSpec === 'string') {
        aggHandler = aggHandlers[aggSpec];

        if (aggHandler) {
            return aggHandler({});
        } else {
            throw new Error(`Invalid aggregation function ${aggSpec}`);
        }
    } else {
        aggHandler = aggHandlers[aggSpec.type];
        if (aggHandler) {
            return aggHandler(aggSpec);
        } else {
            throw new Error(`Invalid aggregation function ${aggSpec.type}`);
        }
    }
}

function getMinStepAndOffset(maxBucketCount, minStep, minValue, maxValue) {
    if (maxValue === null && minValue === null) {
        // This means no data
        return {
            step: 0,
            offset: 0
        };
    }

    const baseStepSizes = [2, 5, 10, 20, 50];
    const len = maxValue - minValue;

    if (maxBucketCount < 1) {
        throw new Error('maxBucketCount must be greater than 0.');
    }

    if (len === 0) {
        return {
            step: 0,
            offset: minValue
        };

    } else {
        const baseExp = Math.floor(Math.log10(len / maxBucketCount));

        for (const baseStepSize of baseStepSizes) {
            const step = Math.pow(10, baseExp) * baseStepSize;
            if (!minStep || step >= minStep) {
                const minRounded = Math.floor(minValue / step) * step;
                const maxRounded = (Math.floor(maxValue / step) + 1) * step; // The histogram intervals are formed as [ xx, xx ) -- i.e. open on the right

                if ((maxRounded - minRounded) / step <= maxBucketCount) {
                    return {
                        step,
                        offset: minRounded
                    };
                }
            }
        }

        // When we get here, we are guaranteed to generate less buckets that maxBucketCount
        // Also, we shouldn't be able to get here unless minStep is specified
        return {
            step: minStep,
            offset: Math.floor(minValue / minStep) * minStep
        };
    }
}


class QueryProcessor {
    constructor(query) {
        this.query = query;
        this.signalMap = query.signalMap;
        this.indexName = getIndexName(query.sigSet);
    }

    createElsScript(field) {
        const signalMap = this.signalMap;
        const fieldNamesMap = {};
        for (const sigCid in signalMap) {
            fieldNamesMap[sigCid] = getFieldName(signalMap[sigCid].id);
        }

        const scriptSource = field.settings.painlessScript;

        // Handlebars replaces {{cid}} by the unique id of the signal
        const scriptTemplate = handlebars.compile(scriptSource, {noEscape: true});
        const scriptSubstituted = scriptTemplate(fieldNamesMap);
        return {source: scriptSubstituted};
    }

    getField(field) {
        if (field.source === SignalSource.DERIVED) {
            return {script: this.createElsScript(field)};
        } else {
            return {field: getFieldName(field.id)};
        }
    }

    createSignalAggs(signals) {
        const signalMap = this.signalMap;
        const aggs = {};

        for (const sig in signals) {
            for (const aggSpec of signals[sig]) {
                const aggHandler = getAggHandler(aggSpec);
                const sigFld = signalMap[sig];

                if (!sigFld) {
                    throw new Error(`Unknown signal ${sig}`);
                }

                const sigFldName = getFieldName(sigFld.id);

                aggs[`${aggHandler.id}_${sigFldName}`] = aggHandler.getAgg(this.getField(sigFld));
            }
        }

        return aggs;
    }

    createElsSort(sort) {
        const allowedSortFields = ['_doc', 'id'];

        const signalMap = this.signalMap;
        const elsSort = [];
        for (const srt of sort) {
            if (srt.sigCid) {
                const field = signalMap[srt.sigCid];

                if (!field) {
                    throw new Error('Unknown field ' + srt.sigCid);
                }

                elsSort.push({
                    [getFieldName(field.id)]: {
                        order: srt.order
                    }
                });
            } else {
                // check for other allowed fields
                if (allowedSortFields.includes(srt.field)) {
                    elsSort.push({
                        [srt.field]: {
                            order: srt.order
                        }
                    });
                } else {
                    throw new Error('Unknown field ' + srt.field);
                }
            }
        }

        return elsSort;
    }


    async computeStepAndOffset() {
        const signalMap = this.signalMap;
        const bucketGroups = new Map();
        const query = this.query;

        const _fetchMinAndMaxForAgg = async agg => {
            const field = signalMap[agg.sigCid];
            if (!field) {
                throw new Error(`Unknown signal ${agg.sigCid}`);
            }
            if (field.type === SignalType.KEYWORD) // min and max don't make sense for keyword
                return { min: undefined, max: undefined };

            const minMaxQry = {
                query: this.createElsFilter(query.filter),
                size: 0,
                aggs: {
                    min_value: {
                        min: this.getField(field)
                    },
                    max_value: {
                        max: this.getField(field)
                    }
                }
            };

            const minMaxResp = await executeElsQry(this.indexName, minMaxQry);

            return {
                min: minMaxResp.aggregations.min_value.value,
                max: minMaxResp.aggregations.max_value.value
            };
        };


        const _fetchMinAndMaxForBucketGroups = async aggs => {
            for (const agg of aggs) {
                const field = signalMap[agg.sigCid];
                if (!field) {
                    throw new Error(`Unknown signal ${agg.sigCid}`);
                }

                if (agg.bucketGroup) {
                    const minMax = await _fetchMinAndMaxForAgg(agg);
                    const bucketGroup = bucketGroups.get(agg.bucketGroup);

                    if (!bucketGroup) {
                        throw new Error(`Unknown bucket group ${agg.bucketGroup}`);
                    }

                    if (bucketGroup.min === undefined || bucketGroup.min > minMax.min) {
                        bucketGroup.min = minMax.min;
                    }

                    if (bucketGroup.max === undefined || bucketGroup.max < minMax.max) {
                        bucketGroup.max = minMax.max;
                    }

                    if (bucketGroup.type === undefined) {
                        bucketGroup.type = field.type;
                    } else if (bucketGroup.type !== field.type) {
                        throw new Error(`Mismatched types ${bucketGroup.type} and ${field.type} for bucket group ${agg.bucketGroup}`);
                    }
                }

                if (agg.aggs) {
                    await _fetchMinAndMaxForBucketGroups(agg.aggs);
                }
            }
        };

        const _computeStepAndOffset = (fieldType, maxBucketCount, minStep, minValue, maxValue) => {
            if (fieldType === SignalType.DATE_TIME) {
                throw new Error('Not implemented');
            } else if (fieldType === SignalType.INTEGER || fieldType === SignalType.LONG || fieldType === SignalType.FLOAT || fieldType === SignalType.DOUBLE) {
                return getMinStepAndOffset(maxBucketCount, minStep, minValue, maxValue);
            } else if (fieldType === SignalType.KEYWORD) {
                return { step: undefined, offset: undefined, maxBucketCount: maxBucketCount };
            } else {
                throw new Error(`Field type ${fieldType} is not supported in aggregations`);
            }

        };

        const _setStepAndOffset = async aggs => {
            for (const agg of aggs) {
                const field = signalMap[agg.sigCid];
                if (!field) {
                    throw new Error(`Unknown signal ${agg.sigCid}`);
                }

                let step;
                let offset;
                let min, max;

                if (agg.hasOwnProperty("min"))
                    min = agg.min;
                if (agg.hasOwnProperty("max"))
                    max = agg.max;

                if (agg.step) {
                    step = agg.step;
                    offset = agg.offset || 0;

                } else if (agg.maxBucketCount) {
                    const minMax = await _fetchMinAndMaxForAgg(agg);
                    const stepAndOffset = _computeStepAndOffset(field.type, agg.maxBucketCount, agg.minStep, minMax.min, minMax.max);
                    step = stepAndOffset.step;
                    offset = stepAndOffset.offset;
                    min = minMax.min;
                    max = minMax.max;

                } else if (agg.bucketGroup) {
                    const bucketGroup = bucketGroups.get(agg.bucketGroup);
                    step = bucketGroup.step;
                    offset = bucketGroup.offset;
                    min = bucketGroup.min;
                    max = bucketGroup.max;
                    if (bucketGroup.maxBucketCount)
                        agg.maxBucketCount = bucketGroup.maxBucketCount;
                } else if (agg.agg_type) {
                    // no step and offset for some types of aggregations (e.g. 'terms')
                    step = undefined;
                    offset = undefined;
                } else {
                    throw new Error('Invalid agg specification for ' + agg.sigCid + ' (' + field.type + '). Either maxBucketCount & minStep or step & offset or bucketGroup or agg_type (and its arguments) have to be specified.');
                }

                if (step !== undefined)
                    agg.computedStep = step;
                if (offset !== undefined)
                    agg.computedOffset = offset;

                if (min !== undefined)
                    agg.computedMin = min;
                if (max !== undefined)
                    agg.computedMax = max;

                if (agg.aggs) {
                    await _setStepAndOffset(agg.aggs);
                }
            }
        };

        for (const bucketGroupId in query.bucketGroups) {
            bucketGroups.set(bucketGroupId, {});
        }

        await _fetchMinAndMaxForBucketGroups(query.aggs);

        for (const bucketGroupId in query.bucketGroups) {
            const bucketGroupSpec = query.bucketGroups[bucketGroupId];
            const bucketGroup = bucketGroups.get(bucketGroupId);
            const stepAndOffset = _computeStepAndOffset(bucketGroup.type, bucketGroupSpec.maxBucketCount, bucketGroupSpec.minStep, bucketGroup.min, bucketGroup.max);
            bucketGroup.step = stepAndOffset.step;
            bucketGroup.offset = stepAndOffset.offset;
            if (stepAndOffset.maxBucketCount)
                bucketGroup.maxBucketCount = stepAndOffset.maxBucketCount;
        }

        await _setStepAndOffset(query.aggs)
    }

    createElsAggs(aggs) {
        const signalMap = this.signalMap;
        const elsAggs = {};
        let aggNo = 0;
        for (const agg of aggs) {
            const field = signalMap[agg.sigCid];
            if (!field) {
                throw new Error(`Unknown signal ${agg.sigCid}`);
            }

            const elsAgg = {};

            if (agg.agg_type) {
                if (agg.agg_type === "terms") {
                    elsAgg.terms = { ...this.getField(field) };
                }
                else {
                    throw new Error("Aggregation type '" + agg.agg_type + "' is currently not supported, try omitting agg_type for default aggregation based on signal type.");
                }
            }
            else {
                if (field.type === SignalType.DATE_TIME) {
                    // TODO: add processing of range buckets

                    elsAgg.date_histogram = {
                        ...this.getField(field),
                        interval: getElsInterval(moment.duration(agg.computedStep || 'PT0.001S' /* FIXME - this is  a hack, find better way to handle situations when there is no interval */)),
                        offset: getElsInterval(moment.duration(agg.computedOffset)),
                        min_doc_count: agg.minDocCount
                    };

                } else if (field.type === SignalType.INTEGER || field.type === SignalType.LONG || field.type === SignalType.FLOAT || field.type === SignalType.DOUBLE) {
                    elsAgg.histogram = {
                        ...this.getField(field),
                        interval: agg.computedStep || 1e-16 /* FIXME - this is  a hack, find better way to handle situations when there is no interval */,
                        offset: agg.computedOffset,
                        min_doc_count: agg.minDocCount
                    };

                    if (agg.hasOwnProperty("computedMin") && Number.isFinite(agg.computedMin) &&
                        agg.hasOwnProperty("computedMax") && Number.isFinite(agg.computedMax))
                    {
                        elsAgg.histogram.extended_bounds = {
                            min: agg.computedMin,
                            max: agg.computedMax
                        }
                    }
                } else if (field.type === SignalType.KEYWORD) {
                    elsAgg.terms = { ...this.getField(field) };
                    if (agg.maxBucketCount)
                        elsAgg.terms.size = agg.maxBucketCount;
                } else {
                    throw new Error('Type of ' + agg.sigCid + ' (' + field.type + ') is not supported in aggregations');
                }
            }

            if (agg.signals) {
                elsAgg.aggs = this.createSignalAggs(agg.signals);
            } else if (agg.aggs) {
                elsAgg.aggs = this.createElsAggs(agg.aggs);
            }

            if (agg.order || agg.limit) {
                elsAgg.aggs.sort = {
                    bucket_sort: {}
                };

                if (agg.order) {
                    elsAgg.aggs.sort.bucket_sort.sort = [
                        {
                            _key: {
                                order: agg.order
                            }
                        }
                    ];
                }

                if (agg.limit) {
                    elsAgg.aggs.sort.bucket_sort.size = agg.limit;
                }
            }

            elsAggs['agg_' + aggNo] = elsAgg;

            aggNo += 1;
        }

        return elsAggs;
    }

    processSignalAggs(signals, elsSignalsResp) {
        const signalMap = this.signalMap;
        const result = {};

        for (const sig in signals) {
            const sigBucket = {};
            result[sig] = sigBucket;

            const sigFldName = getFieldName(signalMap[sig].id);

            for (const aggSpec of signals[sig]) {
                const aggHandler = getAggHandler(aggSpec);
                sigBucket[aggHandler.id] = aggHandler.processResponse(elsSignalsResp[`${aggHandler.id}_${sigFldName}`]);
            }
        }

        return result;
    }

    processElsAggs(aggs, elsAggsResp) {
        const signalMap = this.signalMap;
        const result = [];

        const _processTermsAgg = (aggResp, buckets, additionalResponses) => {
            for (const elsBucket of aggResp.buckets) {
                buckets.push({
                    key: elsBucket.key,
                    count: elsBucket.doc_count
                });
            }
            additionalResponses.doc_count_error_upper_bound = aggResp.doc_count_error_upper_bound;
            additionalResponses.sum_other_doc_count = aggResp.sum_other_doc_count;
        };

        let aggNo = 0;
        for (const agg of aggs) {
            const elsAggResp = elsAggsResp['agg_' + aggNo];

            const buckets = [];
            let additionalResponses = {};

            if (agg.agg_type) {
                if (agg.agg_type === "terms") {
                    _processTermsAgg(elsAggResp, buckets, additionalResponses);
                }
                else {
                    throw new Error("Aggregation type '" + agg.agg_type + "' is currently not supported, try omitting agg_type for default aggregation based on signal type.");
                }
            }
            else {
                const field = signalMap[agg.sigCid];
                if (field.type === SignalType.DATE_TIME) {
                    // TODO: add processing of range buckets

                    for (const elsBucket of elsAggResp.buckets) {
                        buckets.push({
                            key: moment.utc(elsBucket.key).toISOString(),
                            count: elsBucket.doc_count
                        });
                    }

                } else if (field.type === SignalType.INTEGER || field.type === SignalType.LONG || field.type === SignalType.FLOAT || field.type === SignalType.DOUBLE) {
                    for (const elsBucket of elsAggResp.buckets) {
                        buckets.push({
                            key: elsBucket.key,
                            count: elsBucket.doc_count
                        });
                    }
                } else if (field.type === SignalType.KEYWORD) {
                    _processTermsAgg(elsAggResp, buckets, additionalResponses);
                } else {
                    throw new Error('Type of ' + agg.sigCid + ' (' + field.type + ') is not supported in aggregations');
                }
            }

            if (agg.signals) {
                let bucketIdx = 0;
                for (const elsBucket of elsAggResp.buckets) {
                    buckets[bucketIdx].values = this.processSignalAggs(agg.signals, elsBucket);
                    bucketIdx += 1;
                }

            } else if (agg.aggs) {
                let bucketIdx = 0;
                for (const elsBucket of elsAggResp.buckets) {
                    buckets[bucketIdx].aggs = this.processElsAggs(agg.aggs, elsBucket);
                    bucketIdx += 1;
                }
            }

            const res = {
                buckets,
                ...additionalResponses
            };

            if (agg.computedStep) res.step = agg.computedStep;
            if (agg.computedOffset) res.offset = agg.computedOffset;

            result.push(res);
            aggNo += 1;
        }

        return result;
    }

    createElsFilter(flt) {
        const query = this.query;
        const signalMap = this.signalMap;

        if (!flt) return;

        if (flt.type === 'and' || flt.type === 'or') {
            const filter = [];
            for (const fltChild of flt.children) {
                filter.push(this.createElsFilter(fltChild));
            }

            if (flt.type === 'and') {
                return {
                    bool: {
                        must: filter
                    }
                };
            } else {
                return {
                    bool: {
                        should: filter,
                        minimum_should_match: 1
                    }
                };
            }

        } else if (flt.type === 'range') {
            const field = signalMap[flt.sigCid];

            if (!field) {
                throw new Error('Unknown field ' + flt.sigCid);
            }

            const rng = {};
            const rngAttrs = ['gte', 'gt', 'lte', 'lt'];
            for (const rngAttr of rngAttrs) {
                if (flt.hasOwnProperty(rngAttr)) {
                    rng[rngAttr] = flt[rngAttr];
                }
            }

            const rngKeys = Object.keys(rng);
            if (rngKeys.length === 0) {
                throw new Error('No valid range attributes found.');
            }

            const elsFld = this.getField(field);
            if (elsFld.field) {
                return {
                    range: {
                        [elsFld.field]: rng
                    }
                };

            } else if (elsFld.script) {
                let rngCond = '';
                for (const rngAttr of rngKeys) {
                    // TODO probably don't need to check for DERIVED as it is alread in script
                    if (field.source === SignalSource.DERIVED && field.type === SignalType.DATE_TIME) {
                        let attrCond;
                        if (rngAttr === 'gte') {
                            attrCond = '!result.isBefore(ZonedDateTime.parse(params.gte))';
                        } else if (rngAttr === 'gt') {
                            attrCond = 'result.isAfter(ZonedDateTime.parse(params.gt))';
                        } else if (rngAttr === 'lte') {
                            attrCond = '!result.isAfter(ZonedDateTime.parse(params.lte))';
                        } else if (rngAttr === 'lt') {
                            attrCond = 'result.isBefore(ZonedDateTime.parse(params.lt))';
                        }
                        rngCond += ' && ' + attrCond;
                    // TODO check if this condition is allowed for all types, previously was for type painless
                    } else if (field.source === SignalSource.DERIVED) {
                        const rngOp = {gte: '>=', gt: '>', lte: '<=', lt: '<'};
                        rngCond += ' && result' + rngOp[rngAttr] + 'params.' + rngAttr;

                    } else {
                        // TODO also change this message accordingly, see previous todo in this section
                        throw new Error(`Field type ${field.type} is not supported in filter`);
                    }
                }

                return {
                    script: {
                        script: {
                            source: `def exec(def doc) { ${elsFld.script.source} } def result = exec(doc); return result != []${rngCond};`,
                            params: rng
                        }
                    }
                };
            }

        } else if (flt.type === 'mustExist') {
            const field = signalMap[flt.sigCid];

            if (!field) {
                throw new Error('Unknown field ' + flt.sigCid);
            }

            const elsFld = this.getField(field);
            if (elsFld.field) {
                return {
                    exists: {
                        field: elsFld.field
                    }
                };
            } else if (elsFld.script) {
                return {
                    script: {
                        script: {
                            source: `def exec(def doc) { ${elsFld.script.source} } return exec(doc) != [];`
                        }
                    }
                };
            }
        } else if (flt.type === 'wildcard') {
            const field = signalMap[flt.sigCid];
            const elsFld = this.getField(field);
            return {
                wildcard: {
                    [elsFld.field]: flt.value
                }
            }
        } else if (flt.type === 'ids') {
            return {
                ids: {
                    'values': flt.values
                }
            }
        } else if (flt.type === 'function_score') {
            if (!flt.function)
                throw new Error('Function not specified for function_score query');

            return {
                function_score: flt.function
            };
        } else {
            throw new Error(`Unknown filter type "${flt.type}"`);
        }
    }


    async processQueryAggs() {
        const query = this.query;

        await this.computeStepAndOffset();

        const elsQry = {
            query: this.createElsFilter(query.filter),
            size: 0,
            aggs: this.createElsAggs(query.aggs)
        };


        const elsResp = await executeElsQry(this.indexName, elsQry);

        return {
            aggs: this.processElsAggs(query.aggs, elsResp.aggregations)
        };
    }


    async processQueryDocs() {
        const query = this.query;
        const signalMap = this.signalMap;

        const elsQry = {
            query: this.createElsFilter(query.filter),
            _source: [],
            script_fields: {}
        };

        if ('from' in query.docs) {
            elsQry.from = query.docs.from;
        }

        if ('limit' in query.docs) {
            elsQry.size = query.docs.limit;
        }

        for (const sig of query.docs.signals) {
            const sigFld = signalMap[sig];

            if (!sigFld) {
                throw new Error(`Unknown signal ${sig}`);
            }

            const sigFldName = getFieldName(sigFld.id);

            const elsFld = this.getField(sigFld);
            if (elsFld.field) {
                elsQry._source.push(elsFld.field);
            } else if (elsFld.script) {
                elsQry.script_fields[sigFldName] = elsFld;
            }
        }

        if (query.docs.sort) {
            elsQry.sort = this.createElsSort(query.docs.sort);
        }

        const elsResp = await executeElsQry(this.indexName, elsQry);

        const result = {
            docs: [],
            total: elsResp.hits.total
        };

        const withId = query.params && query.params.withId && query.params.withId === true;
        for (const hit of elsResp.hits.hits) {
            const doc = {};

            if (withId) {
                // FIXME possible overwrite for signal named 'id'
                doc.id = hit._id;
            }

            for (const sig of query.docs.signals) {
                const sigFld = signalMap[sig];

                if (sigFld.source === SignalSource.DERIVED) {
                    if (hit.fields) {
                        const valSet = hit.fields[getFieldName(sigFld.id)];
                        if (valSet) {
                            doc[sig] = valSet[0];
                        }
                    }
                } else {
                    doc[sig] = hit._source[getFieldName(sigFld.id)];
                }
            }

            result.docs.push(doc);
        }

        return result;
    }


    async processQuerySummary() {
        const query = this.query;
        const elsQry = {
            query: this.createElsFilter(query.filter),
            size: 0,
            aggs: this.createSignalAggs(query.summary.signals)
        };

        const elsResp = await executeElsQry(this.indexName, elsQry);

        return {
            summary: this.processSignalAggs(query.summary.signals, elsResp.aggregations)
        };
    }

    async processQuery() {
        const query = this.query;

        if (query.aggs) {
            return await this.processQueryAggs();

        } else if (query.docs) {
            return await this.processQueryDocs();

        } else if (query.sample) {
            // TODO
            return {};

        } else if (query.summary) {
            return await this.processQuerySummary();

        } else {
            throw new Error('None of "aggs", "docs", "sample", "summary" query part has been specified');
        }
    }
}


async function processQuery(query) {
    const qp = new QueryProcessor(query);
    return await qp.processQuery();
}

async function query(queries) {
    return await Promise.all(queries.map(processQuery))
}


module.exports.query = query;

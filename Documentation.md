Components
----------

**client/src/ivis/AreaChart.js**

### 1. AreaChart




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|object|yes||
data|object|no||
contentComponent|func|no||
contentRender|func|no||
onClick|func|no||
height|number|no|500|
margin|object|no|&lt;See the source code&gt;|
withTooltip|bool|no|true|
withBrush|bool|no|true|
tooltipContentComponent|func|no||
tooltipContentRender|func|no||
lineCurve|func|no|d3Shape.curveLinear|
-----
**client/src/ivis/BubblePlot.js**

### 1. BubblePlot




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|shape|yes||
maxDotCount|number|no||
minDotSize|number|no||
maxDotSize|number|no||
highlightDotSize|number|no||
colors|arrayOf|no||
xMinValue|number|no||
xMaxValue|number|no||
yMinValue|number|no||
yMaxValue|number|no||
minDotSizeValue|number|no||
maxDotSizeValue|number|no||
minColorValue|number|no||
maxColorValue|number|no||
colorValues|array|no||
xAxisExtentFromSampledData|bool|no||
yAxisExtentFromSampledData|bool|no||
updateColorOnZoom|bool|no||
updateSizeOnZoom|bool|no||
xAxisTicksCount|number|no||
xAxisTicksFormat|func|no||
xAxisLabel|string|no||
yAxisTicksCount|number|no||
yAxisTicksFormat|func|no||
yAxisLabel|string|no||
height|number|yes||
margin|object|no||
withBrush|bool|no||
withCursor|bool|no||
withTooltip|bool|no||
withZoom|bool|no||
withTransition|bool|no||
withRegressionCoefficients|bool|no||
withToolbar|bool|no||
withSettings|bool|no||
withAutoRefreshOnBrush|bool|no||
viewChangeCallback|func|no||
zoomLevelMin|number|no||
zoomLevelMax|number|no||
zoomLevelStepFactor|number|no||
className|string|no||
style|object|no||
-----
**client/src/ivis/DataAccess.js**

### 1. TimeSeriesProvider




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
intervalFun|func|no|&lt;See the source code&gt;|
signalSets|object|yes||
renderFun|func|yes||
loadingRenderFun|func|no||
### 2. TimeSeriesSummaryProvider




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
intervalFun|func|no|&lt;See the source code&gt;|
signalSets|object|yes||
renderFun|func|yes||
loadingRenderFun|func|no||
### 3. TimeSeriesPointProvider




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
tsSpec|object|no|&lt;See the source code&gt;|
signalSets|object|yes||
renderFun|func|yes||
loadingRenderFun|func|no||
-----
**client/src/ivis/FrequencyBarChart.js**

### 1. FrequencyBarChart




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|shape|yes||
colors|arrayOf|no|d3Scheme.schemeCategory10|
getLabel|func|no|&lt;See the source code&gt;|
getColor|func|no|&lt;See the source code&gt;|
height|number|yes||
margin|object|no||
padding|number|no||
withTooltip|bool|no||
withTransition|bool|no||
withZoom|bool|no|false|
className|string|no||
style|object|no||
-----
**client/src/ivis/FrequencyDataLoader.js**

### 1. FrequencyDataLoader




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|shape|yes||
processData|func|yes||
-----
**client/src/ivis/FrequencyPieChart.js**

### 1. FrequencyPieChart




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|shape|yes||
colors|arrayOf|no|d3Scheme.schemeCategory10|
getLabel|func|no|&lt;See the source code&gt;|
getColor|func|no|&lt;See the source code&gt;|
height|number|yes||
margin|object|no||
getArcColor|func|no||
legendWidth|number|no||
legendPosition|number|no||
legendRowClass|string|no||
className|string|no||
style|object|no||
-----
**client/src/ivis/Legend.js**

### 1. StaticLegend




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
label|string|no||
labelClassName|string|no|&lt;See the source code&gt;|
structure|array|no|&lt;See the source code&gt;|
config|array|yes||
onChange|func|no||
className|string|no||
rowClassName|string|no|&lt;See the source code&gt;|
withConfigurator|bool|no||
configSpec|object|no||
updateSelection|func|no||
### 2. Legend




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
label|string|no||
labelClassName|string|no||
configPath|array|yes||
structure|array|no||
className|string|no||
rowClassName|string|no||
withSelector|bool|no||
withConfigurator|bool|no||
configSpec|object|no||
withConfiguratorForAllUsers|bool|no||
updateSelection|func|no||
-----
**client/src/ivis/LineChart.js**

### 1. LineChart




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|object|yes||
data|object|no||
contentComponent|func|no||
contentRender|func|no||
onClick|func|no||
height|number|no|500|
margin|object|no|&lt;See the source code&gt;|
withTooltip|bool|no|true|
withBrush|bool|no|true|
tooltipContentComponent|func|no||
tooltipContentRender|func|no||
tooltipExtraProps|object|no||
getExtraQueries|func|no||
prepareExtraData|func|no||
getSvgDefs|func|no||
getGraphContent|func|no||
createChart|func|no||
compareConfigs|func|no||
lineVisibility|func|no|pointsOnNoAggregation|
lineCurve|func|no|d3Shape.curveLinear|
controlTimeIntervalChartWidth|bool|no|true|
-----
**client/src/ivis/LineChartBase.js**

### 1. LineChartBase




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|object|yes||
data|object|no||
contentComponent|func|no||
contentRender|func|no||
onClick|func|no||
height|number|no||
margin|object|no||
withTooltip|bool|no||
withBrush|bool|no||
tooltipContentComponent|func|no||
tooltipContentRender|func|no||
tooltipExtraProps|object|no||
signalAggs|array|yes||
lineAgg|string|yes||
getSignalValuesForDefaultTooltip|func|no||
prepareData|func|yes||
createChart|func|yes||
getSignalGraphContent|func|yes||
getSvgDefs|func|no||
compareConfigs|func|no||
getLineColor|func|no|&lt;See the source code&gt;|
lineCurve|func|no|d3Shape.curveLinear|
lineVisibility|func|yes||
getExtraQueries|func|no||
processGraphContent|func|no||
controlTimeIntervalChartWidth|bool|no||
withPoints||no|true|
-----
**client/src/ivis/LiveAnimation.js**

### 1. LiveAnimation




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
dataSources|object|yes||
animationId|string|yes||
intervalSpanBefore|object|no|&lt;See the source code&gt;|
intervalSpanAfter|object|no|&lt;See the source code&gt;|
initialStatus|object|no|&lt;See the source code&gt;|
pollRate|number|no|1000|
children|node|no||
-----
**client/src/ivis/MinMaxLoader.js**

### 1. MinMaxLoader

This component fetches the minimum and maximum for given signal(s) and calls props.processData with the values.
The values are given in form: { signalId: { min, max } }.
Time interval filtering (using TimeContext) is also supported.
It has no UI.   




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|shape|yes||
processData|func|yes||
-----
**client/src/ivis/OnOffAreaChart.js**

### 1. OnOffAreaChart




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|object|yes||
data|object|no||
contentComponent|func|no||
contentRender|func|no||
onClick|func|no||
height|number|no|500|
margin|object|no|&lt;See the source code&gt;|
withTooltip|bool|no|true|
withBrush|bool|no|true|
tooltipContentComponent|func|no||
tooltipContentRender|func|no||
tooltipExtraProps|object|no||
-----
**client/src/ivis/PanelConfig.js**

### 1. Configurator




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
configSpec|union|yes||
config|union|yes||
autoApply|bool|no||
onChange|func|yes||
onCloseAsync|func|no||
### 2. SaveDialog




### 3. PermanentLinkDialog




### 4. PdfExportDialog




### 5. PanelConfigAccess




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
configPath|array|no||
statePath|array|no||
render|func|yes||
-----
**client/src/ivis/PieChart.js**

### 1. StaticPieChart




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|object|yes||
data|object|no||
getLabelColor|func|no|&lt;See the source code&gt;|
getArcColor|func|no|&lt;See the source code&gt;|
height|number|yes||
margin|object|no|&lt;See the source code&gt;|
legendWidth|number|no|120|
legendHeight|number|no|100|
legendPosition|number|no|1|
legendRowClass|string|no|&lt;See the source code&gt;|
-----
**client/src/ivis/RecordedAnimation.js**

### 1. RecordedAnimation




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
dataSources|object|yes||
initialIntervalSpec|object|no|&lt;See the source code&gt;|
intervalConfigPath|arrayOf|no|&lt;See the source code&gt;|
defaultGetMinAggregationInterval|func|no||
initialStatus|object|no|&lt;See the source code&gt;|
children|node|no||
-----
**client/src/ivis/Records.js**

### 1. Records




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
signalSetCid|string|no||
signalsVisibleForList|array|no||
-----
**client/src/ivis/SVG.js**

### 1. SVG




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
url|string|no||
source|string|no||
width|string|no||
height|string|no||
maxWidth|string|no||
maxHeight|string|no||
init|func|no||
data|object|no|&lt;See the source code&gt;|
loadingMessage|union|no||
-----
**client/src/ivis/ScatterPlot.js**

### 1. ScatterPlot




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|shape|yes||
maxDotCount|number|no||
dotSize|number|no||
highlightDotSize|number|no||
colors|arrayOf|no||
xMinValue|number|no||
xMaxValue|number|no||
yMinValue|number|no||
yMaxValue|number|no||
minColorValue|number|no||
maxColorValue|number|no||
colorValues|array|no||
xAxisExtentFromSampledData|bool|no||
yAxisExtentFromSampledData|bool|no||
updateColorOnZoom|bool|no||
xAxisTicksCount|number|no||
xAxisTicksFormat|func|no||
xAxisLabel|string|no||
yAxisTicksCount|number|no||
yAxisTicksFormat|func|no||
yAxisLabel|string|no||
height|number|yes||
margin|object|no||
withBrush|bool|no||
withCursor|bool|no||
withTooltip|bool|no||
withZoom|bool|no||
withTransition|bool|no||
withRegressionCoefficients|bool|no||
withToolbar|bool|no||
withSettings|bool|no||
withAutoRefreshOnBrush|bool|no||
viewChangeCallback|func|no||
zoomLevelMin|number|no||
zoomLevelMax|number|no||
zoomLevelStepFactor|number|no||
className|string|no||
style|object|no||
-----
**client/src/ivis/Selector.js**

### 1. StaticSignalSelector




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
sigSetCid|string|no||
sigCid|string|no||
onChange|func|no||
className|string|no||
data|array|no||
columns|array|no|&lt;See the source code&gt;|
labelColumn|string|no|&lt;See the source code&gt;|
### 2. SignalSelector




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
sigSetCid|string|no||
configPath|array|no||
statePath|array|no||
className|string|no||
data|array|no||
columns|array|no||
-----
**client/src/ivis/TimeBasedChartBase.js**

### 1. TimeBasedChartBase




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|object|yes||
data|object|no||
contentComponent|func|no||
contentRender|func|no||
height|number|yes||
margin|object|yes||
withBrush|bool|no||
withTooltip|bool|no||
tooltipContentComponent|func|no||
tooltipContentRender|func|no||
getSignalValuesForDefaultTooltip|func|no||
getQueries|func|yes||
prepareData|func|yes||
createChart|func|yes||
getGraphContent|func|yes||
getSvgDefs|func|no|&lt;See the source code&gt;|
compareConfigs|func|no||
tooltipExtraProps|object|no|&lt;See the source code&gt;|
minimumIntervalMs|number|no|10000|
controlTimeIntervalChartWidth|bool|no||
-----
**client/src/ivis/TimeContext.js**

### 1. TimeContext




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
intervalNames|array|no|&lt;See the source code&gt;|
initialIntervalSpec|object|no|&lt;See the source code&gt;|
getMinAggregationInterval|func|no||
configPath|array|no|&lt;See the source code&gt;|
-----
**client/src/ivis/TimeRangeSelector.js**

### 1. TimeRangeSelector




### 2. PredefTimeRangeSelector




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
ranges|array|yes||
-----
**client/src/ivis/Tooltip.js**

### 1. Tooltip




Property | Type | Required | Default value | Description
:--- | :--- | :--- | :--- | :---
config|any|yes||
signalSetsData|object|no||
selection|object|no||
mousePosition|object|no||
containerWidth|number|yes||
containerHeight|number|yes||
width|number|no|350|
contentComponent|func|no||
contentRender|func|no||
-----
**client/src/ivis/attic/BarChart.js**

### 1. BarChart




-----
**client/src/ivis/attic/BarNavigator.js**

### 1. LineNavigator




-----
**client/src/ivis/attic/LineNavigator.js**

### 1. BarNavigator




-----

<sub>This document was generated by the <a href="https://github.com/marborkowski/react-doc-generator" target="_blank">**React DOC Generator v1.2.5**</a>.</sub>

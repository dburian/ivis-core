"use strict";

/**
 * Provides the definition of all animation contexts, the `animated`
 * function and all implemented interpolations.
 *
 * @module AnimationCommon
 */
import React, {Component} from "react";
import PropTypes from "prop-types";

import {withComponentMixins, createComponentMixin} from "../lib/decorator-helpers";
import styles from "./AnimationCommon.scss";

/**
 * Context specifying the current state of animation's playback.
 * @type {React.Context}
 * @property {boolean} isPlaying - Is set to `true` if the animation is playing or wants to play,
    but is waiting for data, `false` otherwise.

 * @property {boolean} isBuffering - Is set to `true` if the animation is waiting for data, `false`
    otherwise.

 * @property {number} position - Current playback position as an Unix
 * timestamp.
 *
 * @property {number} playbackSpeedFactor - Float specifying the playback's
 * speed.
 *
 * @property {object} error - Object describing arisen animation's error if any,
 * `null` otherwise.
 *
 */
export const AnimationStatusContext = React.createContext(null);

/**
 * Context specifying the currently available animation control functions.
 * @type {React.Context}
 * @property {function} play - Initiates paused playback.

 * @property {function} pause - Temporarily terminates playback.

 * @property {function} jumpForward - Shifts the playback position forwards by a
 * specified number of milliseconds passed as an argument.
 *
 * @property {function} jumpBackward - Shifts the playback position backwards by a
 * specified number of milliseconds passed as an argument.
 *
 * @property {function} seek - Sets the playback position to the given
 * timestamp passed as an argument.
 *
 * @property {function} stop - Resets the playback. Shorthand for pausing the
 * playback and then seeking to its beginning.
 */
export const AnimationControlContext = React.createContext(null);

/**
 * Context specifying the visualization data for the current playback position.
 * @type {React.Context}
 *
 * @property {Object} dataSrcKey - Visualization data generated by the Data
 * source with the given key. Note: `dataSrcKey` only stands for the actual key
 * of a Data source.
 */
export const AnimationDataContext = React.createContext(null);

export const withAnimationControl = createComponentMixin({
    contexts: [
        {context: AnimationStatusContext, propName: 'animationStatus'},
        {context: AnimationControlContext, propName: 'animationControl'}
    ]
});
export const withAnimationStatus = createComponentMixin({
    contexts: [
        {context: AnimationStatusContext, propName: 'animationStatus'},
    ]
});
export const withAnimationData = createComponentMixin({
    contexts: [ {context: AnimationDataContext, propName: 'animationData'} ]
});


/**
 * Higher-Order component that transforms still visualization components into
 * their animated versions.
 *
 * @param {React.Component} VisualizationComp - Still visualization component,
 * whose animated version should the function create.
 * @returns {React.Component} - Given visualization component wrapped by {@link
 * AnimatedContent}.
 */
export function animated(VisualizationComp) {
    /**
      * Component that wraps visualization components, which can then be
      * animated. Consumes {@link AnimationDataContext} and {@link
      * AnimationStatusContext}.
      *
      * @param {object} props
      * @param {string} props.dataSourceKey - Key of the Data source, from which to
      * forward the visualization data to the wrapped visualization component.
        * The data are passed to the wrapped component through the `data`
        * property.
      */
    @withComponentMixins([withAnimationData, withAnimationStatus])
    class AnimatedContent extends Component {
        static propTypes = {
            animationStatus: PropTypes.object.isRequired,
            animationData: PropTypes.object.isRequired,
            dataSourceKey: PropTypes.string.isRequired,

            forwardRef: PropTypes.func,
        }

        constructor(props) {
            super(props);

            this.lastValidData = null;
        }

        render() {
            const {
                forwardRef,
                dataSourceKey,
                animationData,
                animationStatus,
                ...visualizationProps
            } = this.props;

            let message = null;
            let withSpinner = false;

            let data = (animationData && animationData[dataSourceKey]) || this.lastValidData;

            if (data !== null) {
                this.lastValidData = data;
            }

            if (animationStatus.error) {
                message = new String(animationStatus.error);
            } else if (animationStatus.isBuffering) {
                withSpinner = true;
                message =  "Loading...";
            }

            return (
                <div ref={node => this.containerNode = node} className={styles.animatedContainer}>
                    {message &&
                        <div className={styles.loadingOverlay}>
                            <div className={styles.loadingMsgContainer}>
                                {withSpinner &&
                                    <div className={styles.loadingSpinner + " spinner-border"} role={"status"}>
                                        <span className={"sr-only"}>Loading</span>
                                    </div>
                                }
                                <span className={styles.loadingMsg}>{message}</span>
                            </div>
                        </div>
                    }
                    {data && <VisualizationComp {...visualizationProps} data={data} ref={forwardRef} />}
                </div>
            );
        }
    }

    return React.forwardRef(function AnimatedVisualization(props, ref) {
        return <AnimatedContent {...props} forwardRef={ref} />;
    });
}

export * from '../lib/animation-interpolations';

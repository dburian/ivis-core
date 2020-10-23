import React, {Component} from "react";
import PropTypes from "prop-types";

import {withComponentMixins} from "../lib/decorator-helpers";
import {
    withAnimationData,
    withAnimationStatus,
} from "../lib/animation-helpers";
import styles from "./AnimationCommon.scss";

function animated(VisualizationComp) {
    @withComponentMixins([withAnimationData, withAnimationStatus])
    class AnimatedContent extends Component {
        static propTypes = {
            animationStatus: PropTypes.object.isRequired,
            animationData: PropTypes.object.isRequired,
            dataSourceKey: PropTypes.string.isRequired,

            forwardRef: PropTypes.func,
            height: PropTypes.number,
        }

        constructor(props) {
            super(props);

            this.state = {
                visHeight: props.height ? props.height : null,
                visWidth: null,
            };

            this.lastValidData = null;
            this.updateContainerRectBound = ::this.updateContainerRect;
        }

        componentDidUpdate() {
            this.updateContainerRect();
        }

        componentDidMount() {
            this.updateContainerRect();
            window.addEventListener('resize', this.updateContainerRectBound);
        }

        componentWillUnmount() {
            window.removeEventListener('resize', this.updateContainerRectBound);
        }

        updateContainerRect() {
            const msgDisplayed = this.props.animationStatus.isBuffering || this.props.animationStatus.error;
            if (!this.lastValidData || msgDisplayed) return;

            const visRect = this.containerNode.getClientRects()[0];
            if (visRect.width !== this.state.visWidth ||
                visRect.height !== this.state.visHeight) {
                this.setState({visHeight: visRect.height, visWidth: visRect.width});
            }
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

            const overlayStyles = {
                width: this.visWidth ? this.visWidth + "px" : "100%",
                height: this.visHeight ? this.visHeight + "px" : "100%",
            };

            return (
                <div ref={node => this.containerNode = node} className={styles.animatedContainer}>
                    {message &&
                        <div className={styles.loadingOverlay} style={overlayStyles}>
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

export * from "../lib/media-controls";
export * from "../lib/animation-interpolations";
export {
    animated,
};

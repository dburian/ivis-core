import React, {Component} from "react";
import PropTypes from "prop-types";

import {withComponentMixins} from "../lib/decorator-helpers";
import {withAnimationData, withAnimationStatus} from "../lib/animation-helpers";
import styles from "./AnimationCommon.scss";

function animated(VisualizationComp) {
    @withComponentMixins([withAnimationData, withAnimationStatus])
    class AnimatedContent extends Component {
        static propTypes = {
            animationStatus: PropTypes.object.isRequired,
            animationData: PropTypes.object.isRequired,

            forwardRef: PropTypes.func,
            height: PropTypes.number,
            animationDataFormatter: PropTypes.func,
        }

        constructor(props) {
            super(props);

            this.lastValidData = null;
            this.visWidth = null;
            this.visHeight = props.height ? props.height : null;
        }

        componentDidUpdate() {
            this.updateContainerRect();
        }

        componentDidMount() {
            this.updateContainerRect();
        }

        updateContainerRect() {
            if (!this.lastValidData || this.props.animationStatus.isBuffering || this.props.animationStatus.error) return;

            const visRect = this.containerNode.getClientRects()[0];
            this.visWidth = visRect.width;
            this.visHeight = visRect.height;
        }

        render() {
            let message = null;
            let withSpinner = false;
            let data = this.props.animationData;
            if (this.props.animationStatus.error) {
                data = this.lastValidData;

                message = new String(this.props.animationStatus.error);
            } else if (this.props.animationStatus.isBuffering) {
                data = this.lastValidData;

                withSpinner = true;
                message =  "Loading...";
            } else if (data !== null) {
                data = this.props.animationDataFormatter ? this.props.animationDataFormatter(data) : data;
                this.lastValidData = data;
            }

            let width = this.visWidth + "px" || "100%";
            let height = this.visHeight + "px" || "100%";
            const overlayStyles = {
                width: width,
                height: height,
            };

            const msgContainerStyles = {
                paddingTop: this.visHeight/2 + "px" || "0px",
            };

            const {forwardRef, animationDataFormatter, ...visualizationProps} = this.props;

            return (
                <div ref={node => this.containerNode = node}>
                    {message &&
                        <div className={styles.loadingOverlay} style={overlayStyles}>
                            <div className={styles.loadingMsgContainer} style={msgContainerStyles}>
                                {withSpinner &&
                                    <div className={styles.loadingSpinner + " spinner-border"} role={"status"}>
                                        <span className={"sr-only"}>Loading</span>
                                    </div>
                                }
                                <span className={styles.loadingMsg}>{message}</span>
                            </div>
                        </div>
                    }
                    {data && <VisualizationComp {...visualizationProps} data={data} ref={this.props.forwardRef} />}
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

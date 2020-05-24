'use strict'

const log = require('../../server/lib/log');

class AnimationTest {
    constructor() {
        this.refreshRate = 1000/25;
        this.jump = 1/60;
        this.endTs = 1000 * 60;

        this._animationReset();
    }

    _refresh() {
        this.status.position = Math.min(this.endTs, this.status.position + (this.refreshRate * this.status.playbackSpeedFactor));
        this._updateData();

        if (this.iteration % 500) log.info(this.status.position);

        if (this.status.position === this.endTs) {
            this.pause();
        }
    }

    _updateData() {
        this.status.reachedEnd = this.status.position === this.endTs;
        this.status.realtimePosition = this.status.position / this.status.playbackSpeedFactor;
        this.status.data.mutables.circleCx = this.status.position * this.jump;
    }

    _animationReset() {
        this.status = {
            isPlaying: false,
            position: 0,
            realtimePosition: 0,
            playbackSpeedFactor: 1,
            reachedEnd: false,
            data: {
                base: {
                    circle: { cx: {valueId: "circleCx"} }
                },
                mutables: {
                    circleCx: 0
                }
            }
        };
    }

    getStatus() {
        return this.status;
    }

    play() {
        if (!this.status.isPlaying && this.status.position !== this.endTs) {
            this.refreshInterval = setInterval(
                this._refresh.bind(this),
                this.refreshRate
            );

            this.status.isPlaying = true;
        }
    }

    pause() {
        if (this.status.isPlaying) {
            clearInterval(this.refreshInterval);
            this.status.isPlaying = false;
        }
    }

    reset() {
        clearInterval(this.refreshInterval);
        this._animationReset();
    }

    seek(params) {
        const toMs = params.position;
        const wasPlaying = this.status.isPlaying;
        if (wasPlaying) {
            clearInterval(this.refreshInterval);
        }

        const toMsLimited = Math.max(
            0, Math.min(this.endTs, toMs)
        );

        log.info("Debug", "Seek intended to:", toMs, "limited to:", toMsLimited);
        this.status.position = toMsLimited;

        this._updateData();

        if (wasPlaying) {
            this.refreshInterval = setInterval(
                this._refresh.bind(this),
                this.refreshRate
            );
        }
    }

    changeSpeed(params) {
        this.status.playbackSpeedFactor = params.factor;
    }
}

function create() {
    return new AnimationTest();
}
module.exports.create = create;
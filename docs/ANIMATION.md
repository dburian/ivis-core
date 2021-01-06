# Documentation

The implementation of the animation extension is composed mostly of client-side
modules creating new ReactJS components. Nonetheless, some features of Live
animation required also changes to the server-side.

## Client-side

- [LiveAnimation](./LiveAnimation.md) - Defines Live animation (animation of
    real-time data).

- [RecordedAnimation](./RecordedAnimation.md) - Defines Recorded animation
    (animation of time-series data).

- [AnimationControls](./AnimationControls.md) - Defines the new UI controlling
    the animations.

- [AnimationCommon](./AnimationCommon.md) - Defines the common functionality of
    the animations.



## Server-side

- [Master animation instance interface](./mai.md) - Describes the Master
    animation instance (or MAI) interface.

- [routes/live-animation](./routes.md) - Defines new server's API for Live
    animations.

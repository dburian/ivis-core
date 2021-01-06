# Master animation instance

Master animation instances are implementations of stateful data
generators running on the server. They generate real-time data for the
Live animations to visualize.

Each Master animation instance (or MAI) is implemented as an object.  Each MAI
has a unique identifier which is then passed to the instance of
[LiveAnimation](./LiveAnimation.md#liveanimation), which should synchronize with
the given MAI, as **animationId**. For a given MAI to be available to the client
Live animation instances, it must be stored in the IVIS server-side extension
manager under its identifier in the "*animation*" namespace.

## Example

Let us say we have a MAI with the identifier of `monitor` stored in the constant
`serverMonitorMAI`. Then the MAI should be saved as:

```JavaScript
extensionManager.set('animation.monitor', serverMonitorMAI);
```

## Methods
### getStatus

  Retrieves the MAI's animation state. Takes no arguments.

Returns [MAI's animation state](#mais-animation-state).

### pause

  Terminates the data generation. Can be called multiple times, even when the
  data generation is already running. Takes no arguments.

Returns **undefined**.

### play

  Initiates the data generation. Can be called multiple times, even when the
  data generation is already running. Takes no arguments.

Returns **undefined**.

## MAI's animation state

The MAI's animation state describes both the state of the data
generation and the most recent generated data.

### Properties

- `isPlaying` **[boolean][1]**

  `true` when the given MAI is generating data, `false` otherwise.

- `position` **[number][2]**

  Unix timestamp specifying when the most recent data were generated.

- `data` **[object][3]**

  The most recent generated data.

- `data.<signal set cid>` **[object][3]**

  Generated data of the signal set with the given cid.

- `data.<signal set cit>.<signal cid>` **[object][3]**

  Generated data of the signal with the given cid.

- `data.<signal set cid>.<signal cid>.<name of an aggregation function>` **[number][2]**

  Generated datum of the given aggregation function.


[1]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[2]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[3]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[4]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[5]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

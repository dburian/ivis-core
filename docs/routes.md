# routes/live-animation

The added route module creates new API to allow the client
[LiveAnimation](./LiveLiveAnimation.md#liveanimation)s to access Master
animation instances.

## Routes

The routes are parametrized with an identifier of the given MAI, on which should
the route handlers execute the given operation. The route handlers get the MAI
instance from IVIS's extension manager. All routes return **404** if a MAI with
the given identifier was not found and **500** if the executed function threw an
error.

### /rest/animation/:id/status [GET]

Calls the MAI's [getStatus](./mai.md#getstatus) method.

Returns **[MAI's animation state](./mai.md#mais-animation-state)**.


### /rest/animation/:id/play [POST]

Calls the MAI's [play](./mai.md#play) method. Returns 

### /rest/animation/:id/pause [POST]

Calls the MAI's [pause](./mai.md#pause) method and returns the result.

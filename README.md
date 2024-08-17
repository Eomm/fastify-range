# fastify-range

[![ci](https://github.com/Eomm/fastify-range/actions/workflows/ci.yml/badge.svg)](https://github.com/Eomm/fastify-range/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/fastify-range)](https://www.npmjs.com/package/fastify-range)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This Fastify plugin adds support for the [`Range` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range).  
It provides the same API as `expressjs`'s `req.range(size[, options])` with a consistent response.

## Install

```
npm install fastify-range
```

### Compatibility

| Plugin version | Fastify version |
| -------------- |:---------------:|
| `^1.0.0`       | `^4.0.0`        |


## Usage

Register the plugin and use `request.range(size[, options])` in your routes.
The `options` object is optional and it will be passed to the [`range-parser`](https://www.npmjs.com/package/range-parser#api) module under the hood.

The decorator parses the `Range` header, capping to the given `size`. It returns the following response:

- returns `undefined` if the header is missing
- if `throwOnInvalid` is true, throws an error if the header is an invalid string, otherwise returns `undefined`
- if `throwOnInvalid` is true, throws an error if the range is unsatisfiable, otherwise returns `undefined`
- when the header is good, it returns an object with the following example structure:

```js
{
  unit: 'bytes',
  ranges: [
    { start: 0, end: 99 },
    { start: 100, end: 199 },
    { start: 200, end: 299 }
  ]
}
```

### Example

```js
const fastify = require('fastify')
const range = require('fastify-range')

const app = fastify()
app.register(range, { throwOnInvalid: true })

app.get('/', (request, reply) => {
  const size = 1000
  const options = { combine: true }
  return 'Read: ' + request.range(size, options)
})
```


### Options

You can pass the following options during the registration:

| Option | Default | Description |
|--------|---------|-------------|
|`throwOnInvalid`| `false`  | If `true`, it throws an error if the header is invalid or unsatisfiable. |


## License

Licensed under [MIT](./LICENSE).

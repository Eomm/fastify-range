# fastify-range

[![ci](https://github.com/Eomm/fastify-range/actions/workflows/ci.yml/badge.svg)](https://github.com/Eomm/fastify-range/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/fastify-range)](https://www.npmjs.com/package/fastify-range)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This Fastify plugin adds support for the [`Range` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range).
It provides the same API as `expressjs`'s `req.range()`.

## Install

```
npm install fastify-range
```

### Compatibility

| Plugin version | Fastify version |
| -------------- |:---------------:|
| `^1.0.0`       | `^4.0.0`        |


## Usage

```js
const fastify = require('fastify')
const range = require('fastify-range')

const app = fastify()
app.register(range)

app.get('/', (req, reply) => {
  const size = 1000
  const options = { combine: true }
  return 'Read: ' + req.range(size, options)
})
```


### Options

You can pass the following options during the registration:

| Option | Default | Description |
|--------|---------|-------------|
|`change`| `me`  | What does this opt?


## License

Licensed under [MIT](./LICENSE).

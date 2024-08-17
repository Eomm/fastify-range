'use strict'

const fp = require('fastify-plugin')
const rangeParser = require('range-parser')

function fastifyRange (fastify, options, next) {
  if (fastify.hasRequestDecorator('range')) {
    return next(new Error('fastify-range cannot be registered more than once'))
  }

  const throwOnInvalid = options?.throwOnInvalid

  fastify.decorateRequest('range', function range (size, rangeParserOptions) {
    const range = this.headers.range
    if (!range) { return }

    const res = rangeParser(size, range, rangeParserOptions)
    if (res < 0) {
      if (throwOnInvalid && res === -2) {
        throw new Error('Malformed header string')
      } else if (throwOnInvalid && res === -1) {
        throw new Error('Unsatisfiable range')
      }

      return undefined
    }

    return { unit: res.type, ranges: res }
  })

  next()
}

const plugin = fp(fastifyRange, {
  fastify: '^4.x',
  name: 'fastify-range'
})

module.exports = plugin
module.exports.default = plugin
module.exports.fastifyRange = fastifyRange

'use strict'

const fp = require('fastify-plugin')
const rangeParser = require('range-parser')

function fastifyRange (fastify, options, next) {
  if (fastify.hasRequestDecorator('range')) {
    return next(new Error('fastify-range cannot be registered more than once'))
  }

  fastify.decorateRequest('range', function range (size, options) {
    const range = this.headers.range
    if (!range) return
    return rangeParser(size, range, options)
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

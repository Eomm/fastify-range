'use strict'

const { test } = require('tap')
const fastify = require('fastify')

const plugin = require('../index')

async function buildApp (t, opts) {
  const app = fastify()
  app.register(plugin, opts)
  t.teardown(() => app.close())

  return app
}

test('Basic usage', async t => {
  t.plan(2)

  const app = await buildApp(t)

  app.get('/', (req, reply) => {
    t.ok(app.hasRequestDecorator('range'))
    return {}
  })

  const res = await app.inject('/')
  t.equal(res.statusCode, 200)
})

test('Basic API', async t => {
  t.plan(2)

  const app = await buildApp(t)

  app.get('/', (req, reply) => {
    return {
      range: req.range(100)
    }
  })

  const res = await app.inject({
    url: '/',
    headers: {
      range: 'bytes=0-200, 100-300'
    }
  })

  t.equal(res.statusCode, 200)
  t.same(JSON.parse(res.body), {
    range: [
      { start: 0, end: 99 } // trimmed to 100
    ]
  })
})

test('Double register must fail', async t => {
  t.plan(1)

  const app = await buildApp(t)

  try {
    await app.register(plugin)
    t.fail()
  } catch (error) {
    t.equal(error.message, 'fastify-range cannot be registered more than once')
  }
})

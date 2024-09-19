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

test('Expectations', async t => {
  const app = await buildApp(t)

  app.get('/', (req, reply) => {
    return req.range(100, { combine: false }) || null
  })

  const expectations = [
    [null, null],
    ['bytes=0-200, 100-300', { unit: 'bytes', ranges: [{ start: 0, end: 99 }] }],
    ['bytes=50-99', { unit: 'bytes', ranges: [{ start: 50, end: 99 }] }],
    ['users=0-3', { unit: 'users', ranges: [{ start: 0, end: 3 }] }]
  ]
  t.plan(expectations.length * 2)

  for (const [range, out] of expectations) {
    const res = await app.inject({
      url: '/',
      headers: { ...(range ? { range } : {}) }
    })

    t.equal(res.statusCode, 200)
    t.same(res.json(), out)
  }
})

test('Expectations - can loop ranges', async t => {
  const app = await buildApp(t)
  t.plan(5)

  app.get('/', (req, reply) => {
    const ranges = req.range(1000, { combine: false })
    t.equal(ranges.ranges.length, 2)
    t.same(ranges.ranges, [{ start: 0, end: 99 }, { start: 900, end: 999 }])

    for (const range of ranges.ranges) {
      t.ok(range.start <= range.end)
    }

    return ranges
  })

  const res = await app.inject({
    url: '/',
    headers: { range: 'bytes=0-99, 900-999' }
  })

  t.equal(res.statusCode, 200)
})

test('Failure Expectations with throwOnInvalid:true', async t => {
  const app = await buildApp(t, { throwOnInvalid: true })

  app.get('/', (req, reply) => {
    return req.range(100, { combine: false }) || null
  })

  const expectations = [
    ['bytes=100-200', 'Unsatisfiable range'],
    ['asd', 'Malformed header string']
  ]
  t.plan(expectations.length * 2)

  for (const [range, out] of expectations) {
    const res = await app.inject({
      url: '/',
      headers: { ...(range ? { range } : {}) }
    })

    t.equal(res.statusCode, 500)
    t.same(res.json().message, out)
  }
})

test('Failure Expectations with throwOnInvalid:false', async t => {
  const app = await buildApp(t)

  app.get('/', (req, reply) => {
    return req.range(100, { combine: false }) || null
  })

  const expectations = [
    ['bytes=100-200', null],
    ['asd', null]
  ]
  t.plan(expectations.length * 2)

  for (const [range, out] of expectations) {
    const res = await app.inject({
      url: '/',
      headers: { ...(range ? { range } : {}) }
    })

    t.equal(res.statusCode, 200)
    t.same(res.json(), out)
  }
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

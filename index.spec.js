const sinon = require('sinon')
const kue = require('kue')

const FAKE_REDIS_URL = 'redis-url'
const helpersExportFn = require('./index')
const helpers = helpersExportFn(FAKE_REDIS_URL)

let stubs = []

test('it throws an error when the redisUrl param is not provided', () => {
  expect(helpersExportFn).toEqual(expect.any(Function))
  expect(() => {
    helpersExportFn()
  }).toThrow('Missing parameter redisUrl. A valid Redis URL is needed to provide to Kue.')
})

describe('helpers', () => {
  afterEach(() => {
    stubs.forEach(stub => stub.restore())
    stubs = []
  })
  describe('.enqueueJob', () => {
    it('returns a promise', async () => {
      const result = helpers.enqueueJob('SomeJob', {})
      expect(result.then).toEqual(expect.any(Function))
    })
  })
  describe('.processAsyncJob', () => {
    it('calls queue.process with the given job name', () => {
      const spy = sinon.spy()
      const stub = sinon.stub(kue, 'createQueue').returns({ process: spy })
      stubs.push(stub)
      const jobName = 'ProcessSomething'

      helpers.processAsyncJob(jobName)

      expect(spy.calledWith(jobName)).toEqual(true)
    })
  })
})

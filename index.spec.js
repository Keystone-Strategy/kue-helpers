const kue = require('kue')

const FAKE_REDIS_URL = 'redis-url'
const helpersExportFn = require('./index')
const helpers = helpersExportFn(FAKE_REDIS_URL)

test('it throws an error when the redisUrl param is not provided', () => {
  expect(helpersExportFn).toEqual(expect.any(Function))
  expect(() => {
    helpersExportFn()
  }).toThrow('Missing parameter redisUrl. A valid Redis URL is needed to provide to Kue.')
})

describe('helpers', () => {
  describe('.enqueueJob', () => {
    it('returns a promise', async () => {
      const result = helpers.enqueueJob('SomeJob', {})
      expect(result.then).toEqual(expect.any(Function))
    })
  })
  describe('.processAsyncJob', () => {
    it('calls queue.process with the given job name', () => {
      const spy = jest.fn()
      const stub = jest.spyOn(kue, 'createQueue').mockReturnValue({ process: spy })
      const jobName = 'ProcessSomething'

      helpers.processAsyncJob(jobName)

      expect(spy).toHaveBeenCalled()

      stub.mockRestore()
    })
  })
})

const kue = require('kue')

let getQueue

const getQueueBuilder = redisUrl => () => {
  return kue.createQueue({
    redis: redisUrl
  })
}

const enqueueJob = (jobName, jobData) => {
  return new Promise((resolve, reject) => {
    const queue = getQueue()

    queue
      .create(jobName, jobData)
      .removeOnComplete(true)
      .save()
      .on('complete', res => {
        resolve(res)
      })
      .on('failed', err => {
        reject(err)
      })
      .on('error', err => {
        reject(err)
      })
  })
}

const handleResponse = (promise, done) => {
  promise
    .then(data => {
      done(null, data)
    })
    .catch(err => {
      done(err)
    })
}

const processAsyncJob = (jobName, asyncFn) => {
  const queue = getQueue()

  queue.process(jobName, async (job, done) => {
    try {
      const result = await asyncFn(job)
      done(null, result)
    } catch (err) {
      done(err)
    }
  })
}

module.exports = redisUrl => {
  if (typeof redisUrl !== 'string') {
    throw new Error('Missing parameter redisUrl. A valid Redis URL is needed to provide to Kue.')
  }

  getQueue = getQueueBuilder(redisUrl)

  return {
    getQueue,
    enqueueJob,
    handleResponse,
    processAsyncJob
  }
}

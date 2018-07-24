const kue = require("kue")

const NOT_CONNECTED_TO_DB_MESSAGE =
	"Worker not connected to database. kue-helpers checked the database connection and it was not equal to 1. This means that the database isn't connected and will cause the worker thread to hang since Mongoose queues requests, which then time out. Please fix the database connection and restart the worker."

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

const processAsyncJob = connectToDatabase => (jobName, asyncFn) => {
  const queue = getQueue()

  queue.process(jobName, async (job, done) => {
    try {
      if (connectToDatabase().readyState !== 1) throw new Error(NOT_CONNECTED_TO_DB_MESSAGE)
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

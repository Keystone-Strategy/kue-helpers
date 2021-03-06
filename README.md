# kue-helpers
Simple, high-level promise-based helpers for [Kue (the Node.js job Queue)](https://github.com/Automattic/kue).

```
yarn add kue-helpers
```

# Usage
The default export is a function which has one required parameter: a redis url to provide to Kue. When supplied with a redis url, that function will return an object with the helper methods.

```
const kueHelpers = require('kue-helpers')(REDIS_URL)

kueHelpers.getQueue() // the queue object from Kue
```

## Helper Methods
### getQueue
No parameters.

Returns Kue's `queue` object by calling `kue.createQueue`.

### enqueueJob
Parameters
1. Job Name (String)
2. Job Data (Object)

Returns a promise that executes the `then` on Kue's `complete` event, and rejects on Kue's `failed` event.

Example
```
const promise = enqueueJob('ExpensesBulkUpdate', { expenses, upsert: true })
```

### handleResponse
Parameters:
1. A promise
2. The done callback from Kue's `queue.process` method

Example
```
kue.createQueue(...).process(jobName, (job, done) => {
  handleResponse(methodThatReturnsAPromise(), done)
})
```

### processAsyncJob
Parameters:
1. Database connection (Function). A function to get the status of the database connection. Expects an object to be returned with a property called `readyState` that represents that connection status of the database. A ready state of 1 means the database is connected and a ready state of anything other than 1 means that database isn't connected and will cause an error to be thrown in the job.
2. Job Name (String)
3. async Function

Example
```
processAsyncJob('ExpensesBulkUpdate', async job => {
  const { expenses, upsert } = job.data
  ... etc
})
```

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
1. Job Name (String)
2. async Function

Example
```
processAsyncJob('ExpensesBulkUpdate', async job => {
  const { expenses, upsert } = job.data
  ... etc
})
```

## Error Handling
You can pass a function on the initialization for treat the error message returned by Kue.
The process will be rejected with the result of applying that function to the message returned by Kue.

Example
```
const errorHlandlerFunction = errorMessage => new Error('Worker Error: ${errorMessage}')
const kueHelpers = require('kue-helpers')(REDIS_URL)
```

Yes only error messages, not the stack trace, are passed back to the server process - here is why:
[Send along error message when emitting a failed event](https://github.com/Automattic/kue/issues/461#issuecomment-62698472)

Also you can see the 
[Source Code](https://github.com/Automattic/kue/commit/7ff625240e86e4c0db47a9bf03bf6a976b481c52)
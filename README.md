# promise-pool
This promise pool keeps looping `Promise.all`'s promises until the last generator item is submitted to the processor.

## Install
`$ npm install @rodrigogs/promise-pool`

## Usage
```javascript
const promisePool = require('@rodrigogs/promise-pool');
 
function* generatorFunction(start, end) { // Could be an async generator
  for (let i = start; i <= end; i += 1) {
    yield i;
  }
}

function processor(generatorValue) { // Could be an async function
  console.log(generatorValue);
}

(async () => {
  await promisePool({
    generator: generatorFunction(100, 1000),
    processor,
    concurrency: 10,
  });
})();
```

## License
[BSD-3-Clause](https://github.com/rodrigogs/promise-pool/blob/master/LICENSE) © Rodrigo Gomes da Silva

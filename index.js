/**
 * This promise pool keeps looping `Promise.all`'s promises until the last generator
 * item is submitted to the processor.
 *
 * @example
 * const promisePool = require('@rodrigogs/promisePool');
 *
 * function* generatorFunction(start, end) { // Could be an async generator
 *   for (let i = start; i <= end; i += 1) {
 *     yield i;
 *   }
 * }
 *
 * function processor(generatorValue) { // Could be an async function
 *   console.log(generatorValue);
 * }
 *
 * await promisePool({
 *   generator: generatorFunction(100, 1000),
 *   processor,
 *   concurrency: 10,
 * });
 *
 * @generator
 * @function promisePool
 * @param {Object} options Options object
 * @param {Generator|AsyncGenerator} options.generator Initialized generator or
 * async generator object to feed the poller
 * @param {Function} options.processor This function will be concurrently executed
 * against each generator value.
 * If a `false` value is strictly returned from the processor function, its very `thread` dies.
 * The poller is able to resolve promises, so it can be an async function.
 * @param {Number} options.concurrency Number of parallel processors running simultaneously.
 * @param {Object} [options.hooks] Flow hooks object.
 * @param {Function} [options.hooks.beforeProcessor] An optional beforeProcessor hook function
 * to intercept the poller from an outside scope.
 * This function will be called in every iteration before executing the processor function,
 * and it receives the current generator value as argument.
 * Once it returns explicitly `false` the `threads` will begin to stop after finishing the current iteration.
 * This can be an async function.
 * @param {Function} [options.hooks.afterProcessor] An optional afterProcessor hook function
 * to intercept the poller from an outside scope.
 * This function will be called in every iteration after executing the processor function,
 * and it receives the current generator value and the result value from the processor.
 * Once it returns explicitly `false` the `threads` will begin to stop after finishing the current iteration.
 * This can be an async function.
 *
 * @returns {Promise<void>}
 */
module.exports = async ({
  generator,
  processor,
  concurrency,
  hooks: {
    beforeProcessor = () => {},
    afterProcessor = () => {},
  } = {},
}) => {
  const queue = Array(concurrency).fill(null);

  let stop = false;

  const poller = async () => {
    let value, done, result;
    do {
      ({ value, done } = await generator.next());
      if (done) return;
      if (await beforeProcessor(value) === false) { stop = true; continue; }
      result = await processor(value);
      if (result === false) { stop = true; continue; }
      if (await afterProcessor(value, result) === false) { stop = true; }
    } while (!stop);
  };

  await Promise.all(queue.map(poller));
};

const promisePool = require('.');

describe('promisePool', () => {

  it('Should submit generator items to the processor concurrently', async () => {
    const values = [];
    const expected = Array(90).map((v, i) => (10 + i));

    function* generatorFn(startNumber, endNumber) {
      for (let number = startNumber; number <= endNumber; number += 1) {
        yield number;
      }
    }

    function processor(value) {
      values.push(value);
    }

    await promisePool({
      generator: generatorFn(10, 100),
      processor,
      concurrency: 10,
    });

    expect(values).toEqual(expect.arrayContaining(expected));
  }, 10000);

  it('Should submit generator items to the async processor concurrently', async () => {
    const values = [];
    const expected = Array(90).map((v, i) => (10 + i));

    async function asyncCall(value) {
      return value;
    }

    async function* generatorFn(startNumber, endNumber) {
      for (let number = startNumber; number <= endNumber; number += 1) {
        yield await asyncCall(number);
      }
    }

    function processor(value) {
      values.push(value);
    }

    await promisePool({
      generator: generatorFn(10, 100),
      processor,
      concurrency: 10,
    });

    expect(values).toEqual(expect.arrayContaining(expected));
  }, 10000);

  it('Should receive current generator value from the beforeProcessor hook', async () => {
    const values = [];
    const expected = Array(1000).fill(1);

    async function asyncCall(value) {
      return new Promise(resolve => setTimeout(resolve, (10 + value)));
    }

    async function* generatorFn(startNumber, endNumber) {
      for (let number = startNumber; number <= endNumber; number += 1) {
        yield await asyncCall(number);
      }
    }

    function processor(value) {
      values.push(value);
    }

    let index = 0;
    await promisePool({
      generator: generatorFn(10, 100),
      processor,
      concurrency: 10,
      hooks: {
        beforeProcessor(value) {
          expect(value).toEqual(values[index])
          index++;
        }
      },
    });

    expect(values).not.toEqual(expect.arrayContaining(expected));
  }, 10000);

  it('Should receive processor result from the afterProcessor hook', async () => {
    const values = [];
    const expected = Array(1000).fill(1);

    async function asyncCall(value) {
      return new Promise(resolve => setTimeout(resolve, (10 + value)));
    }

    async function* generatorFn(startNumber, endNumber) {
      for (let number = startNumber; number <= endNumber; number += 1) {
        yield await asyncCall(number);
      }
    }

    function processor(value) {
      values.push(value);
    }

    let index = 0;
    await promisePool({
      generator: generatorFn(10, 100),
      processor,
      concurrency: 10,
      hooks: {
        afterProcessor(value, result) {
          expect(value).toEqual(values[index])
          expect(result).toEqual(undefined)
          index++;
        }
      },
    });

    expect(values).not.toEqual(expect.arrayContaining(expected));
  }, 10000);

  it('Should halt the poller returning a `false` value from the beforeProcessor hook', async () => {
    const values = [];
    const expected = Array(11).fill(undefined);

    async function asyncCall(value) {
      return new Promise(resolve => setTimeout(resolve, (1 + value)));
    }

    async function* generatorFn(startNumber, endNumber) {
      for (let number = startNumber; number <= endNumber; number += 1) {
        yield await asyncCall(number);
      }
    }

    function processor(value) {
      values.push(value);
    }

    await promisePool({
      generator: generatorFn(10, 100),
      processor,
      concurrency: 10,
      hooks: {
        beforeProcessor() {
          if (values.length > 10) {
            return false;
          }
        }
      },
    });

    expect(values).toEqual(expect.arrayContaining(expected));
  }, 10000);

  it('Should halt the poller returning a `false` value from the afterProcessor hook', async () => {
    const values = [];
    const expected = Array(11).fill(undefined);

    async function asyncCall(value) {
      return new Promise(resolve => setTimeout(resolve, (10 + value)));
    }

    async function* generatorFn(startNumber, endNumber) {
      for (let number = startNumber; number <= endNumber; number += 1) {
        yield await asyncCall(number);
      }
    }

    function processor(value) {
      values.push(value);
    }

    await promisePool({
      generator: generatorFn(10, 100),
      processor,
      concurrency: 10,
      hooks: {
        afterProcessor() {
          if (values.length > 10) {
            return false;
          }
        }
      },
    });

    expect(values).toEqual(expect.arrayContaining(expected));
  }, 10000);

  it('Should terminate the threads by returning false in the processor', async () => {
    const values = [];
    const expected = Array(500).fill(0).map((v, i) => (v + i));

    function* generatorFn() {
      let i = 0;
      do {
        yield i;
        i += 1;
      } while (i > 0);
    }

    function processor(value) {
      if (value > 500) {
        return false;
      }
      values.push(value);
    }

    await promisePool({
      generator: generatorFn(),
      processor,
      concurrency: 10,
    });

    expect(values).toEqual(expect.arrayContaining(expected));
  }, 10000);

});

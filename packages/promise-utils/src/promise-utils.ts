export async function shortCircuit(promiseInstance, timeInMs) {
  const timerPromise = new Promise((resolve, reject) => {
    setTimeout(() => reject('Timeout'), timeInMs);
  });
  return Promise.race([promiseInstance, timerPromise]);
}

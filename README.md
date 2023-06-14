# screenshottoGoogleDrive
async: The async keyword is used to define an asynchronous function. An asynchronous function always returns a Promise.  
It allows you to use the await keyword inside the function body.

await: The await keyword is used to pause the execution of an async function until a Promise is fulfilled or rejected.  
It can only be used inside an async function. When await is used, it waits for the Promise to resolve, and then it returns the  
resolved value. If the Promise is rejected, it throws an error, which can be caught using try/catch blocks.


By using async/await, you can write asynchronous code in a more synchronous style without explicitly chaining .then() callbacks or handling .catch() for error handling. It makes the code look cleaner and more readable.



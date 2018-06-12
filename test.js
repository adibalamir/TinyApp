function generateRandomString() {
  let alphnum = 'qwertyuiopasdfghjklzxcvbnm1234567890';
  let randomURL = '';
  for (let i = 0; i < 6; i++) {
    randomURL += alphnum[Math.floor(Math.random()*36)];
  }
  return randomURL;
}

console.log(generateRandomString());
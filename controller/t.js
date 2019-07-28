let axios = require('axios')

function getIP() {
  return new Promise((resovle, reject) => {
    axios.get('http://200019.ip138.com/').then(res => {
      let ip = res.data.match(/\d+\.\d+\.\d+\.\d+/)[0];
      resovle(ip)
    }).catch(err => {
      reject(err)
    })
  })
}
(async () => {
  console.log(await getIP());
  console.log(666);
})();

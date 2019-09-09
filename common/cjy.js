var rest = require('restler');
let fs = require('fs')
module.exports = (img) => {
  return new Promise((resolve, reject) => {
    rest.post('http://upload.chaojiying.net/Upload/Processing.php', {
      multipart: true,
      data: {
        'user': 'wlasd5688',
        'pass': '111qqq',
        'softid': '894153',
        'codetype': '9004',
        // 'userfile': rest.file(filename, null, fs.statSync(filename).size, null, 'image/png')
        'file_base64': img.replace('data:image/png;base64,', '')
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).on('complete', function (data) {
      console.log(data);
      if (data.err_str === 'OK' && data.pic_str) {
        let local = data.pic_str.split('|').map(item => {
          return {
            x: item.split(',')[0],
            y: item.split(',')[1]
          }
        })
        resolve(local)
      } else {
        reject(data.err_no)
      }
    });
  })
}

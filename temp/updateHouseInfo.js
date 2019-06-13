var mysql = require('mysql');
let fs=require('fs')
class Update {
  constructor() {
    this.dbConfig = {
      host: '101.201.49.69',
      user: 'refresh',
      password: 'Dianzhijia@1',
      port: '3306',
      database: 'datarefresh',
      useConnectionPooling: true,
    }
  }

  handleDisconnect() {
    console.log(`>>>handleDisconnect`);
    return new Promise((resolve, reject) => {
      this.connection = mysql.createConnection(this.dbConfig);
      this.connection.connect(async function (err) {
        if (err) {
          console.log('error when connecting to db:', err);
          reject()
        } else {
          resolve();
        }
      });
      this.connection.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          reject()
        } else {
          throw err;
        }
      });
    })
  }

  execSql(sql) {
    console.log(sql);
    return new Promise((resolve, reject) => {
      try {
        this.connection.query(sql, function (err, value) {
          if (err) {
            reject(err)
          } else {
            resolve(value)
          }
        })
      } catch (err) {
        reject(err)
      }
    })
  }
  async main() {
    await this.handleDisconnect()
    let result = await this.execSql(`select * from house_info`)
    console.log(JSON.stringify(result));
    fs.writeFileSync('./temp/newHouseInfo.json',JSON.stringify(result))
  }
}
new Update().main()

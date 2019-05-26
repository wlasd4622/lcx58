let fs = require('fs')
let path = require('path')
let mysql = require('mysql');
let connection = mysql.createConnection({
    host: '101.201.49.69',
    user: 'refresh',
    password: 'Dianzhijia@1',
    database: 'datarefresh'
});

connection.connect();

// JSON.parse(fs.readFileSync('./cookies/')
let userNameList = [];
queryHouseList(() => {
    let list = fs.readdirSync('D:/58_cookie')
    list.map(filename => {
        // if (String((filename.match(/\d+/g) || []).pop() || 0).length > 5 && userNameList.includes(filename.match(/\d+/g).pop())) {
        if (String((filename.match(/\d+/g) || []).pop() || 0).length > 5 && userNameList.includes(filename.match(/\d+/g).pop()) && filename.indexOf('.lnk') == -1) {
            readFile(path.join('D:/58_cookie', filename))
        }
    })
});

function readFile(file) {
    let username = file.match(/\d+/g).pop();
    // let newArr = []
    // console.log(file);
    // let arr = JSON.parse(fs.readFileSync(file))
    // arr.map(item => {
    //     let {
    //         domain,
    //         name,
    //         path,
    //         value,
    //         expirationDate
    //     } = item;
    //     if (expirationDate) {
    //         newArr.push({
    //             domain,
    //             name,
    //             path,
    //             value,
    //             expirationDate
    //         })
    //     }

    // })
    let value = encodeURIComponent(fs.readFileSync(file));
    console.log("username", username)
    insert(username, value)
}




function insert(username, value) {
    let sql = `INSERT INTO cookie (username,\`value\`) VALUES ('${username}','${value}');\n`
    fs.appendFileSync(`./db/insertCookie.sql`, sql)
        // console.log(sql);
        // connection.query(sql, function (error, results, fields) {
        //   if (error) throw error;
        //   console.log('insertSuccess');
        // });
}



function queryHouseList(cb) {
    let sql = 'SELECT username FROM house_list WHERE username IS NOT NULL GROUP BY username';
    connection.query(sql, function(error, results, fields) {
        if (error) throw error;
        results.map(item => {
            userNameList.push(item.username)
        })
        cb && cb()
    });
}
//----------

// let sql = `SELECT * from cookie where username='13002422180'`;
// connection.query(sql, function (error, results, fields) {
//   if (error) throw error;
//   console.log(results)
// });
let u = require('../common.util.js')
module.exports = {
  houseMap: {},
  init() {
    if (!fs.existsSync('./house.json')) {
      fs.writeFileSync('./house.json', JSON.stringify({}));
    }
    this.houseMap = JSON.parse(fs.readFileSync('./house.json').toString());
  },
  main() {
    u.log(`>>>updateHouseIdTask>main`);
    this.init();
    for (let index = 0; index < this.userList.length; index++) {
      this.log(`user.index:${index}`)
      let user = this.userList[index];
      if (user.user_name.includes('廊坊')) {
        this.log(user)
        let sql = `select * from gj_user where username='${user.user_name}'`
        try {
          let userList = await this.execSql(0, sql)
          user = Object.assign(user, userList[0])
        } catch (err) {
          this.log(err)
        }
        if (user.session && user.status == 0) {
          await this.get58HouseId(user);
        }
      }
    }
    this.log(`task2-END`)
  },
  aa() {

  }
}

var houseData = [{
  "id": 1,
  "house_key": "F2730835_2229_445E_97C7_l3F7612771DA.STR",
  "url": "http://cq.58.com/shangpu/38450985034402x.shtml",
}]

var index = 0;
function updateHouseInfo(key, status, houseUrl) {
  index = index + 1
  console.log('key:' + key);
  console.log('status:' + status);
  console.log('houseUrl:' + houseUrl);
  let url = `https://api.dianzhijia.com/api/open/changegeneralizestatus`
  let data = {
    transfer_store_id: key
  }
  if (key.length > 20) {
    url = `https://api.dianzhijia.com/api/open/changebjspgeneralizestatus`
    data = {
      pid: key
    }
  }
  data.status = status;
  if (houseUrl) {
    data.wbUrl = houseUrl;
    data.gjUrl = houseUrl.replace('58.com/shangpu/', 'ganji.com/wbdetail/shangpu/')
  }

  $.ajax({
    url,
    type: 'post',
    headers: {
      Accept: `application/vnd.dpexpo.v1+json`
    },
    data,
    success: function (res) {
      if (res && res.data) {
        //更新成功
        console.log('更新成功');
      } else {
        //更新失败
        console.log('更新失败');
      }
    },
    error: function (err) {
      console.log(err);
    }
  })
}
var item = houseData[index]
updateHouseInfo(item.house_key, 3510,item.url)

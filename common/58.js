// https://wlasd4622.github.io/lcx58/common/58.js
function getHouseDetail() {
  //标题
  var title = $('.house-title h1').text().trim();
  //图片列表
  var picList = $('#leftImg li').toArray().map((item) => {
    return $(item).data('value').split('?')[0]
  }).join('|')
  //租金
  var moneyNum = $('span.house_basic_title_money_num').text();
  //租金单位
  var moneyNumUnit = $('span.house_basic_title_money_unit').text();
  //出租
  var numChuZu = $('span.house_basic_title_money_num_chuzu').text();
  //出租单位
  var numChuZuUnit = $('span.house_basic_title_money_unit_chuzu').text();
  //平均每平米多少元
  var avrageMoney = $('span.house_basic_title_money_num_chushou').text().split('元')[0] || 0
  var avrageMoneyUnit = avrageMoney ? ('元' + $('span.house_basic_title_money_num_chushou').text().split('元')[1]) : ''
  //转让费
  var transferFee = parseFloat($('span.house_basic_title_money_zrf').text()) || 0
  //转让费单位
  var transferFeeUnit = $('span.house_basic_title_money_zrf').text().replace(transferFee, '')
  //baseContent
  var baseContent = $(`<div>${$('ul.house_basic_title_content').html().replace(/[\n\t\r]/g, '').replace(/\&nbsp\;/g, '')}</div>`);
  //面积
  var span = baseContent.find('span:contains(面积)').next().text().trim().replace(/\s/g, '');
  var area = span.match(/\d+/)[0];
  var areaUnit = span.match(/\d+(.*)/)[1];
  //类型
  var span = baseContent.find('span:contains(类型)').next().text().trim().replace(/\s/g, '');
  var type = span.split('-')[0];
  //是否临街
  var isStreet = span.split('-')[1];
  //楼层
  var span = baseContent.find('span:contains(楼层)').next().text().trim().replace(/\s/g, '');
  var curFloor = span.split('/')[0].replace('层', '');
  var totalFloot = span.split('/')[1].match(/\d+/)[0];
  //规格
  var span = baseContent.find('span:contains(规格)').next().text().trim().replace(/\s/g, '');
  //面宽
  var sWidth = parseFloat(span.split('、')[0].replace('面宽', ''));
  //进深
  var sDeep = parseFloat(span.split('、')[1].replace('进深', ''));
  //层高
  var sHeight = parseFloat(span.split('、')[2].replace('层高', ''));
  //状态
  var status = baseContent.find('span:contains(状态)').next().text().trim().replace(/\s/g, '');
  //付款方式
  var span = baseContent.find('span:contains(付款方式)').next().text().trim().replace(/\s/g, '');
  var payType1 = span && span.match(/付(\d+)/)[1]; //付
  var payType2 = span && span.match(/押(\d+)/)[1]; //押
  //经营行业
  var span = baseContent.find('span:contains(经营行业)').next().text().trim().replace(/\s/g, '');
  var industry = span;
  //起租期
  var span = baseContent.find('span:contains(起租期)').next().text().trim().replace(/\s/g, '');
  var minMonth = span && span.match(/\d+/)[0]
  //免租期
  var rentFreePeriod = span && span.match(/\d+/g)[1] || 0;
  //剩余租期
  var span = parseInt(baseContent.find('span:contains(剩余租期)').next().text().trim().replace(/\s/g, '')) || 0;
  var endMonth = span;
  //客流
  var span = baseContent.find('span:contains(客流)').next().text().trim().replace(/\s/g, '');
  var passengerFlow = span;
  //位置
  var span = baseContent.find('span:contains(位置)').parent().find('span,a').toArray();
  var address1 = baseContent.find('span:contains(位置)').parent().find('span,a').eq(1).text();
  var address2 = baseContent.find('span:contains(位置)').parent().find('span,a').eq(2).text();
  var address3 = baseContent.find('span:contains(位置)').parent().find('span,a').eq(3).text().trim()
  //----------------------------
  //姓名
  var name = $('.agent-name').text().trim().split('(')[0];
  //是否是个人
  var isSingle = $('.agent-name').text().trim().indexOf('个人') > -1 ? true : false;
  //phone
  var phone = $('p.phone-num').text();
  //phoneAddress
  var phoneAddress = $('.phone-belong').text().replace('电话归属地 :', '').trim()
  //配套
  var peotao = $('#peitao li.peitao-on').toArray().map(item => {
    return $(item).text().trim()
  });
  //描述
  var describe = $('#generalSound .general-item-wrap').html().trim().replace(/\n/g, '').replace(`<p name="data_2">联系我时，请说是在58同城上看到的，谢谢！</p>`, '');
  //houseDetailData
  window.houseDetailData = {
    title, //标题
    picList, //图片列表
    moneyNum, //租金
    moneyNumUnit, //租金单位
    numChuZu, //出租
    numChuZuUnit, //出租单位
    avrageMoney, //平均每平米多少元
    avrageMoneyUnit, //平均每平米多少元单位
    transferFee, //转让费
    transferFeeUnit, //转让费单位
    area, //面积
    areaUnit, //面积单位
    type, //类型
    isStreet, //是否临街
    curFloor, //当前层
    totalFloot, //总楼层
    sWidth, //面宽
    sDeep, //进深
    sHeight, //层高
    status, //状态
    payType1, //付款方式1
    payType2, //付款方式2
    industry, //经营行业
    minMonth, //起租期
    rentFreePeriod, //免租期
    endMonth, //剩余租期
    passengerFlow, //客流
    address1, //位置1
    address2, //位置2
    address3, //位置3
    name, //姓名
    isSingle, //是否是个人
    phone, //phone
    phoneAddress, //phoneAddress
    peotao, //配套
    describe, //描述
    xiaoqu: ____json4fe.xiaoqu, //小区
  }
  window.houseDetailValue = encodeURIComponent(JSON.stringify(houseDetailData));
  return window.houseDetailValue || ''
}

function getTitle() {
  let title = houseDetailData.title.replace(/\(.*?\)/, '')
  if (title.length < 10) {
    title = houseDetailData.address3 + ' ' + title
  }
  if (title.length < 10) {
    title = houseDetailData.address2 + ' ' + title
  }
  if (title.length < 10) {
    title = houseDetailData.address1 + ' ' + title
  }
  return title.trim().substr(0, 30);
}

function addHouseInfoData(code, userName) {
  window.houseDetailData = JSON.parse(decodeURIComponent(`${code}`))
  //分类  商铺租售/生意转让
  //
  //出租，转让，出售
  if (houseDetailData.title.indexOf("(转让)") > -1) {
    $('[name=fenlei] [data-value=511571]').click();
    //转让费
    $('[name=params_214] input').val(houseDetailData.transferFee || 1)
    //剩余租期
    $('[name=params_215] input').val(houseDetailData.endMonth)
  } else if (houseDetailData.title.indexOf("(出租)") > -1) {
    $('[name=fenlei] [data-value=511570]').click();
    $('[name=type] [data-value="2"]').click();
  } else if (houseDetailData.title.indexOf("(出售)") > -1) {
    $('[name=fenlei] [data-value=511570]').click();
    $('[name=type] [data-value="0"]').click();
  }
  // 商铺类型
  $('[name=params_204] .optiondef li:contains(' + houseDetailData.type.substr(0, 3) + ')').click();
  //商铺性质
  $('[name=params_122] .optiondef li[val=2]').click()
  //当前状态
  $('[name=params_205] label:contains(' + houseDetailData.status + ')').click()
  //经营行业
  $('[name=params_22701] .optiondef li:contains(' + houseDetailData.industry + ')').click();
  $('[name=params_20601] .optiondef li:eq(1)').click();

  //建筑面积
  $('[name=mianJi] input').val(houseDetailData.area);
  //楼层
  $('[name=zongLouCeng] input').val(houseDetailData.totalFloot)
  if (houseDetailData.curFloor.includes('-')) {
    //多层
    $('[name=params_109] .optiondef li:contains(多层)').click()
    $('[name=suoZaiLouCeng] input').val(parseInt(houseDetailData.curFloor.split('-')[0]))
    $('[name=params_219] input').val(parseInt(houseDetailData.curFloor.split('-')[1]))
  } else {
    //单层
    $('[name=params_109] .optiondef li:contains(单层)').click()
    $('[name=suoZaiLouCeng] input').val(parseInt(houseDetailData.curFloor))
  }
  //面宽
  $('[name=params_207] input').val(houseDetailData.sWidth);
  //层高
  $('[name=params_208] input').val(houseDetailData.sHeight);
  //进深
  $('[name=params_209] input').val(houseDetailData.sDeep);
  //是否临街
  houseDetailData.isStreet === '临街' ? $('[name=params_211] [data-value]:eq(0)').click() : $('[name=params_211] [data-value]:eq(1)').click();
  // 商铺配套
  houseDetailData.peotao.map(name => {
    $('[name=params_110] label:contains(' + name + ')').click();
  })
  //商铺位置
  $('[name=localArea01] .optiondef li:contains(' + houseDetailData.address1.replace('区', '') + ')').click();
  $('[name=localDiduan01] .optiondef li:contains(' + houseDetailData.address2 + ')').click();
  $('[name=xiangXiDiZhi] input').val(houseDetailData.address3).keyup();
  setTimeout(() => {
    let li = $(`[name=xiangXiDiZhi] .tooltip li[key='${houseDetailData.address3}']:eq(0)`)
    if (li.length) {
      li.click()
    }
    setTimeout(() => {
      let li = $(`[name=xiangXiDiZhi] .tooltip li[key='${houseDetailData.address3}']:eq(0)`)
      if (li.length) {
        li.click()
      }
    }, 1000)
  }, 1000)
  //客流人群
  $('[name=params_210] label:contains(' + (houseDetailData.passengerFlow === '暂无数据' ? '其他' : houseDetailData.passengerFlow) + ')').click();
  //租金
  $('[name=jiaGe05] input').val(houseDetailData.moneyNum);
  //租金单位
  $('[name=jiageDanwei] .optiondef li:contains(' + houseDetailData.moneyNumUnit + ')').click();
  //支付方式
  // var payType1 = span && span.match(/付(\d+)/)[1];//付
  // var payType2 = span && span.match(/押(\d+)/)[1];//押
  $('[name=params_119] input').val(houseDetailData.payType1); //付
  $('[name=params_118] input').val(houseDetailData.payType2); //押
  //起租期
  $('[name=params_116] input').val(houseDetailData.minMonth || 1);
  //免租期
  $('[name=params_117]:visible input').val(houseDetailData.rentFreePeriod || 0)
  //标题
  $('[name=title] input').val(getTitle());
  //描述
  $('#edui1 iframe').contents().find('body').html(houseDetailData.describe);
  //上传图片
  //
  //联系人
  $('[name=contactName] input').val(houseDetailData.name)
  //是否是个人
  $('[name=params_202] .optiondef li:contains(' + (houseDetailData.isSingle ? '个人' : '经纪人') + ')').click();
  //联系电话
  $('[name=phone] input').val(parseInt(houseDetailData.phone) ? parseInt(houseDetailData.phone) : userName)


  console.log(houseDetailData);
}

function getAddHosueInfoStatus() {
  var status = -8930
  var paytips = $('.paytips').text().replace(/[\s\t\n]/g, '');
  if (paytips.indexOf('发帖权限已用尽') > -1) {
    status = 3513
  } else if (paytips.match(/本月还可免费发帖(\d+)条/) && paytips.match(/本月还可免费发帖(\d+)条/)[1] && parseInt(paytips.match(/本月还可免费发帖(\d+)条/)[1])) {
    status = 3514
  }
  return status
}

//%7B%22title%22%3A%22(%E8%BD%AC%E8%AE%A9)%20%E5%B7%B4%E5%8D%97%E7%9B%88%E5%88%A9%E7%9B%88%E5%88%A9%E5%AE%BE%E9%A6%86%E8%BD%AC%E8%AE%A9%22%2C%22picList%22%3A%22https%3A%2F%2Fpic4.58cdn.com.cn%2Fp1%2Fbig%2Fn_v28ad7450e13e34ace973177862e81ea7c.jpg%7Chttps%3A%2F%2Fpic1.58cdn.com.cn%2Fp1%2Fbig%2Fn_v2028046a8b06543f9a2c514811b7aa9fd.jpg%7Chttps%3A%2F%2Fpic7.58cdn.com.cn%2Fp1%2Fbig%2Fn_v29860a17b2e284cfc8ac80141f4e63465.jpg%7Chttps%3A%2F%2Fpic8.58cdn.com.cn%2Fp1%2Fbig%2Fn_v205453de2eafc49dfa870906c38844ac0.jpg%7Chttps%3A%2F%2Fpic7.58cdn.com.cn%2Fp1%2Fbig%2Fn_v2cfc908a0f6494f0680049c2e0f3968bb.jpg%7Chttps%3A%2F%2Fpic2.58cdn.com.cn%2Fp1%2Fbig%2Fn_v2f2763199716a4009a69485a2f411da63.jpg%7Chttps%3A%2F%2Fpic5.58cdn.com.cn%2Fp1%2Fbig%2Fn_v2e4a12a32f4574951ab24ab317bf3cf0c.jpg%7Chttps%3A%2F%2Fpic8.58cdn.com.cn%2Fp1%2Fbig%2Fn_v2fdf7788b33524aa588050f32814c05bd.jpg%7Chttps%3A%2F%2Fpic2.58cdn.com.cn%2Fp1%2Fbig%2Fn_v296cbfbc8a82249099ece279299e011c5.jpg%22%2C%22moneyNum%22%3A%2215000%22%2C%22moneyNumUnit%22%3A%22%E5%85%83%2F%E6%9C%88%22%2C%22numChuZu%22%3A%22%22%2C%22numChuZuUnit%22%3A%22%22%2C%22avrageMoney%22%3A0%2C%22avrageMoneyUnit%22%3A%22%22%2C%22transferFee%22%3A48%2C%22transferFeeUnit%22%3A%22%E4%B8%87%E5%85%83%22%2C%22area%22%3A%22938%22%2C%22areaUnit%22%3A%22%E3%8E%A1%22%2C%22type%22%3A%22%E5%95%86%E4%B8%9A%E8%A1%97%E5%95%86%E9%93%BA%22%2C%22isStreet%22%3A%22%E4%B8%B4%E8%A1%97%22%2C%22curFloor%22%3A%221-2%22%2C%22totalFloot%22%3A%223%22%2C%22sWidth%22%3A16%2C%22sDeep%22%3A26%2C%22sHeight%22%3A5%2C%22status%22%3A%22%E7%BB%8F%E8%90%A5%E4%B8%AD%22%2C%22payType1%22%3A%221%22%2C%22payType2%22%3A%223%22%2C%22industry%22%3A%22%E9%A4%90%E9%A5%AE%E7%BE%8E%E9%A3%9F%22%2C%22minMonth%22%3A%22%22%2C%22rentFreePeriod%22%3A0%2C%22endMonth%22%3A36%2C%22passengerFlow%22%3A%22%E5%85%B6%E4%BB%96%22%2C%22address1%22%3A%22%E5%B7%B4%E5%8D%97%E5%8C%BA%22%2C%22address2%22%3A%22%E6%9D%8E%E5%AE%B6%E6%B2%B1%22%2C%22address3%22%3A%22%E5%9C%9F%E6%A1%A5%E6%AD%A3%E8%A1%9713%E5%8F%B7%22%2C%22name%22%3A%22%E8%88%92%E8%80%81%E5%B8%88%22%2C%22isSingle%22%3Atrue%2C%22phone%22%3A%2215923633193%22%2C%22phoneAddress%22%3A%22%E9%87%8D%E5%BA%86%22%2C%22peotao%22%3A%5B%22%E4%B8%AD%E5%A4%AE%E7%A9%BA%E8%B0%83%22%2C%22%E7%BD%91%E7%BB%9C%22%2C%22%E6%9A%96%E6%B0%94%22%2C%22%E4%B8%8A%E6%B0%B4%22%2C%22%E4%B8%8B%E6%B0%B4%22%2C%22%E6%8E%92%E6%B1%A1%22%5D%2C%22describe%22%3A%22%3Cp%3E%E2%80%8B%E6%9C%AC%E9%85%92%E5%BA%97%E4%BD%8D%E4%BA%8E%E6%B8%9D%E5%8D%97%E5%88%86%E6%B5%81%E9%81%93%20%E7%BA%A2%E5%85%89%E7%AB%8B%E4%BA%A4%20%E6%97%81%E8%BE%B9%E6%98%AF%E5%B1%8F%E9%83%BD%E5%B0%8F%E5%8C%BA%20%E6%B0%B8%E8%BE%89%E8%B6%85%E5%B8%82%20%E6%A5%BC%E4%B8%8B%E6%9C%89%E5%B9%BC%E5%84%BF%E5%9B%AD%20%E6%B1%BD%E4%BF%AE%E5%8E%82%20%E7%A6%BB%E5%AD%A6%E6%A0%A1%E5%BE%88%E8%BF%91%20%E7%B4%A7%E6%8C%A8%E5%B7%B4%E5%8D%97%E4%B8%AD%E5%AD%A6%20%E7%90%86%E5%B7%A5%E5%A4%A7%E5%AD%A6%20%E6%9C%AC%E9%85%92%E5%BA%97%E6%98%AF%E7%8B%AC%E6%A0%8B%20%E4%B8%80%E5%85%B13%E5%B1%82%E6%A5%BC%20%E6%88%BF%E9%97%B4%E5%B9%B2%E5%87%80%E6%95%B4%E6%B4%81%20%E5%AE%BD%E5%A4%A7%E6%98%8E%E4%BA%AE%20%E6%96%B0%E8%A3%85%E4%BF%AE%20%E5%86%85%E8%AE%BE%E6%9C%89%E5%8D%A1%E6%8B%89OK%20%E5%AE%B6%E5%BA%AD%E5%BD%B1%E9%99%A2%20%E5%A4%9A%E5%8A%9F%E8%83%BD%E4%BC%9A%E8%AE%AE%E5%8E%85%20%E6%A3%8B%E7%89%8C%20%E9%9C%B2%E5%A4%A9%E5%96%9D%E8%8C%B6%20%E4%BC%91%E6%81%AF%E5%BA%A6%E5%81%87%E7%9A%84%E4%B8%80%E7%AB%99%E5%BC%8F%E9%85%92%E5%BA%97%20%E7%BD%91%E8%AF%844.8%E5%88%86%20%E7%94%9F%E6%84%8F%E7%A8%B3%E5%AE%9A%20%E8%80%8C%E4%B8%94%E6%88%BF%E7%A7%9F%E4%BE%BF%E5%AE%9C%20%E5%85%8D%E8%B4%B9%E5%81%9C%E8%BD%A6%E4%BD%8D%E5%9B%A0%E6%9C%89%E5%B0%BD%E6%9C%89%20%E6%9C%AC%E4%BA%BA%E5%9B%A0%E5%B9%B4%E7%BA%AA%E5%A4%A7%E4%BA%86%E4%B8%8D%E6%83%B3%E7%BB%8F%E8%90%A5%E4%BA%86%20%E6%AC%A2%E8%BF%8E%2C%E8%80%85%E5%89%8D%E4%BE%86%E8%80%83%E5%AF%9F%20%E5%B7%B2%E5%90%88%E4%BD%9C%E4%B8%AD%E4%BB%8B%2C%E5%8B%BF%E6%89%B0%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3Cbr%3E%3Cbr%3E%3C%2Fp%3E%22%2C%22xiaoqu%22%3A%7B%22baidulat%22%3A%2229.460962%22%2C%22baidulon%22%3A%22106.552522%22%2C%22dizhi%22%3A%22%E5%9C%9F%E6%A1%A5%E6%AD%A3%E8%A1%9713%E5%8F%B7%22%2C%22lon%22%3A0%2C%22lat%22%3A0%7D%7D

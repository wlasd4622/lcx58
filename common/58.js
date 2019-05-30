// https://wlasd4622.github.io/lcx58/common/58.js
function getHouseDetail() {
    //标题
    var title = $('.house-title h1').text().trim().substr(0, 30);
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
    var payType1 = span && span.match(/(\d+)/g)[0];
    var payType2 = span && span.match(/(\d+)/g)[1];
    //经营行业
    var span = baseContent.find('span:contains(经营行业)').next().text().trim().replace(/\s/g, '');
    var industry = span;
    //起租期
    var span = baseContent.find('span:contains(起租期)').next().text().trim().replace(/\s/g, '');
    var minMonth = span && span.match(/\d+/)[0]
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
    var describe = $('#generalSound .general-item-wrap').html().trim();
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
    }
    window.houseDetailValue = encodeURIComponent(JSON.stringify(houseDetailData));
    return window.houseDetailValue || ''
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
            $('[name=xiangXiDiZhi] .tooltip li:eq(0)').click()
            setTimeout(() => {
                $('[name=xiangXiDiZhi] .tooltip li:eq(0)').click()
            }, 1000)
        }, 1000)
        //客流人群
    $('[name=params_210] label:contains(' + (houseDetailData.passengerFlow === '暂无数据' ? '其他' : houseDetailData.passengerFlow) + ')').click();
    //租金
    $('[name=jiaGe05] input').val(houseDetailData.moneyNum);
    //租金单位
    $('[name=jiageDanwei] .optiondef li:contains(' + houseDetailData.moneyNumUnit + ')').click();
    //支付方式
    $('[name=params_119] input').val(houseDetailData.payType2);
    $('[name=params_118] input').val(houseDetailData.payType1);
    //起租期
    $('[name=params_116] input').val(houseDetailData.minMonth || 1);
    //免租期
    //
    //标题
    $('[name=title] input').val(houseDetailData.title.replace(/\(.*?\)/, '').trim().substr(0, 30));
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
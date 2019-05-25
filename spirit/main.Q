//免费刷新：直接刷新			0
//发布超过30天：发新帖		3030
//7天内超过4次:重新编辑		3070
//免费刷新用完：不管 			3100
//个人删除 					3404
//需返回修改 				3401
//订单异常					3500
//审核不通过 				3501
//--------------------------------------
//账户正常					0
//密码错 					4000
//未实名认证 				4001
//认证超时 					4002
//用户名不存在				4003
//账户异常					4004
//账户需要设置cookie			4005
//--------------------------------------
Dim id, chromeSrc, mysql,houseInfo
configStatus = config()
If configStatus = 0 Then
    call checkChrome()
    Call main()
End If
//--------------------------------------
Function config()
    status=0
    Path = Plugin.Sys.GetDir(0)
    Call Plugin.File.WriteINI("Command", "name", "58",Path+"\58config.ini")
    chromeSrc = Plugin.File.ReadINI("Command", "chromeSrc", Path + "\58config.ini")
    If (chromeSrc = "") Then
        status=-1
        MessageBox "请设置chrome目录"
    End If
    config=status
End Function
Function loadJquery()
    execjs ("window.$=null;")
    execjs("var script=document.createElement('script');script.type='text/javascript';script.src='https://cdn.bootcss.com/jquery/2.1.2/jquery.min.js';document.getElementsByTagName('head')[0].appendChild(script); ")
    Do
        Delay 10
        flag = execjs("$===null")
        flag=CBool(flag)
    Loop While flag
End Function
Function refresh()
    //title
    title=execjs("$('body .rightside-publish-content .my-item-item:eq(0) .t').text()")
    //status
    status = execjs("$('body .rightside-publish-content .my-item-item:eq(0) .my-item-item-tb-content-states-p1').text()")
    //orderId
    orderId = execjs("$('body .rightside-publish-content .my-item-item:eq(0) .my-item-item-header-code').text().match(/\d+/)[0]")
    MessageBox "title:" + title
    MessageBox "status:" + status
    MessageBox "orderId:" + orderId
    url = "https://refreshplus.vip.58.com/refreshplus/pc/normalrefreshpage?infoId=" + orderId + "&source=1#/immediate"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    //        length = find("document.querySelectorAll('.nav-item').length", "查找刷新页面的tabs")
    length = find("document.querySelectorAll('.nav-item').length", "查找刷新页面元素")
    If length > 0 Then
        Call loadJquery()
        execjs("$('.form-body').remove()")
        execjs ("document.querySelectorAll('.nav-item')[1]. click()")
        length = find("$('.form-body').length", "切换免费刷新tab")
        index = execjs("$('.form-body').text().trim().indexOf('30天不享有免费刷新')")
        If index = "" Then
            index=0
        End If
        index=CInt(index)
        If index > - 1  Then
            //发布超过30天：发新帖		3030
            orderStatus=3030
        Else
            MessageBox "待刷新"
        End If
        MessageBox "orderStatus:"+cstr(orderStatus)
    End If
End Function
Function houseList()
    //订单列表
    orderStatus=0
    url = "https://fangmypost.58.com/fang/infoall/notabs"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    length = find("$('body .rightside-publish-content .my-item-item').length","个人中心房产列表")
    If length > 0 Then
        houseId = houseInfo(0)
        length = find("$('.my-item-item-header-code:contains("+houseId+")').length", "查找是否存在制定房屋id的信息")
        If length > 0 Then
            //获取房产状态
            //免费刷新：直接刷新:0,
            //发布超过30天：发新帖3030,
            //7天内超过4次:重新编辑3070,
            //免费刷新用完：不管 :3100,
            //个人删除 :3404,
            //需返回修改 :3401,
            //订单异常:3500 ,
            //审核不通过 :3501
            //账户需未实名认证:4001
            state=execjs("$('.my-item-item-header-code:contains("+houseId+")').parents('.my-item-item-tb:eq(0)').attr('state')")
            If state = "" Then
                state = - 1
            Else
                state=cint(state)
            End If
            If state = 2 Then
                //账户需未实名认证:4001
                houseStatus = 4001
                MessageBox "账户需未实名认证:4001"
            Else
                Call refresh()
            End If
        Else
            MessageBox "未查找到此条记录"
        End If
    End If
End Function
Function main()
    Call mySqlConnect()
    Call start()
    Rem fLogin
    MessageBox "login"
    status = login()
    call updateStatus(user,status)
    If status = 0 Then 
        Goto fLogin
        //正常登陆成功
        //Call publish()
        Call houseList()
        Call quit()
        EndScript
    Else
        //账号异常
        Goto fLogin
    End If
End Function
Function find(str,c)
    TracePrint "find   "+c
    TracePrint str
    count = 0
    length=0
    Do
        Delay 150
        length = execjs(str)
        If length = "" Then
            length=0
        End If
        length = CInt(length)
        count = count + 1
        TracePrint count
    Loop While length = 0 and count < 200
    find=length
End Function
Function execjs(str)
    result= Plugin.chrome.exec_js(id,str)
    execjs=result
End Function
Function login()
    Call Plugin.chrome.load(id, "https://passport.58.com/logout")
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    Call clearAllCookie()
    length = find("$('.passwordlogin').length", "查找登录窗口")
    If length > 0 Then
        loginStatus = 0
        //判断登录窗口类型
        Call Plugin.chrome.exec_js(id,"if($('.change_qrcode[type_attr=pclogin]').length){$('.pop_head .qrcode').click()}")
        Delay 500
        // 输入搜索内容
        //(userName, password,houseListId,key,url,cookie)
        Dim fGetUser
        user = getUser()
        cookie = user(5)
        If cookie <> "" Then 
            Call setCookie(cookie)
        End If
        Call Plugin.chrome.exec_js(id, "$('#username').val('').focus().val('"+user(0)+"');")
        Delay 500
        Call Plugin.chrome.exec_js(id, "$('#password').val('').focus().val('"+user(1)+"');")
        Delay 500
        Call Plugin.chrome.exec_js(id,"verifyobject.isverifyaccount=true;verifyobject.isverifyvalidcode1=true;verifyobject.isverifypwd=true;")
        // 点击登录按钮
        Call Plugin.chrome.exec_js(id, "$('#btn_account').click();")
        count = 0 
        Do
            loginStatus = 0
            Delay 500
            result = execjs("$('.password_msg.msg:visible').length||0")
            If result = "" Then
                result=0
            End If
            If CInt(result) = 1 Then  
                loginStatus = 4000
                TracePrint Trim(execjs("$('.password_msg.msg:visible').parent().text()"))
            End If
            result1 = execjs("$('.write.write58').length||0")
            If result1 = "" Then
                result1=0
            End If
            If CInt(result1) = 1 Then  
                loginStatus =4004
                TracePrint "您的账户存在安全风险"
            End If
            url = Plugin.chrome.get_url(id)
            TracePrint url
            count=count+1
        Loop While InStr(url, "my.58.com/index") = 0 and count < 10
    Else
        loginStatus=4004
        MessageBox "未处理异常"
    End If
    login=loginStatus
End Function
Function updateStatus(userInfo, status)
    //每次只能更新一个字段
    //获取待插入的id
    sql = "select max(id) as id from `log`"
    TracePrint sql
    call Plugin.Super_MySQL.mysql_query(mysql, sql)
    store = Plugin.Super_MySQL.store_result(mysql)
    rows = Plugin.Super_MySQL.num_rows(store)
    If rows > 0 Then 
        maxId = Plugin.Super_MySQL.fetch_text(store, "id")
        If maxId = "" Then 
            maxId="1"
        End If
        maxId = cstr(cint(maxId)+1)
        //insert id 
        sql = "INSERT into log (id) value(" + maxId + ")"
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        call Plugin.Super_MySQL.num_rows(store)
        //update house_key
        sql = "UPDATE log SET `house_key`='" + userInfo(3) + "' WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        call Plugin.Super_MySQL.num_rows(store)
        //update status
        sql = "UPDATE log SET `status`=" + cstr(status) + " WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        call Plugin.Super_MySQL.num_rows(store)
        //update create_date
        sql = "UPDATE log SET `create_date`=now() WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        call Plugin.Super_MySQL.num_rows(store)
    Else 
        TracePrint "未处理异常12"
        MessageBox "未处理异常12"
    End if
End Function
Function start()
    // 启动浏览器
    If Plugin.chrome.launch(chromeSrc, "--user-data-dir") = False Then
        TracePrint "启动失败"
        Call start()
    Else 
        // 获取启动浏览器后的默认标签
        id = Plugin.chrome.get_ids()
        If id = "" Then
            call start()
        End If
    End If
End Function
Function object()
    Dim o
    Set o = CreateObject("Scripting.Dictionary")
    o.Add "hash", "1"
    MessageBox o.Item("hash")
    object=1
End Function
Function publish()
    Call find("$('#commonTopbar_login').length", "查找登录用户")
    Delay 1000
    //发布信息
    //Call Plugin.chrome.exec_js(id, "clickLog('from=my_post_btn');")
    Call Plugin.chrome.exec_js(id,"$(function(){window.location.href=`https://post.58.com/fang/1/14/s5?PGTID=${window.getGTID()}&ClickID=2`})")
    // 等待载入完成
    Delay 1000
    call find("$('.submit_wrap').length","查找发布按钮")
    //分类
    Call Plugin.chrome.exec_js(id,"$('div[name=fenlei] [data-value=511570]').click()")
    //供求
    Call Plugin.chrome.exec_js(id,"$('div[name=type] [data-value=0]').click()")
    //商铺类型
    Call Plugin.chrome.exec_js(id,"$('div[name=params_204] .optiondef').show()")
    Call Plugin.chrome.exec_js(id,"$('div[name=params_204] .optiondef li[val=2]').click()")
    //商铺性质
    Call Plugin.chrome.exec_js(id,"$('div[name=params_122] .optiondef').show()")
    Call Plugin.chrome.exec_js(id,"$('div[name=params_122] .optiondef li[val=2]').click()")
    //当前状态
    Call Plugin.chrome.exec_js(id,"$('div[name=params_205] [data-value=1]').click()")
    //经营行业
    Call Plugin.chrome.exec_js(id,"$('div[name=params_22701] .optiondef').show()")
    Call Plugin.chrome.exec_js(id,"$('div[name=params_22701] .optiondef li[val=511574]').click()")
    Call Plugin.chrome.exec_js(id,"$('div[name=params_20601] .optiondef').show()")
    Call Plugin.chrome.exec_js(id,"$('div[name=params_20601] .optiondef li[val=511591]').click()")
    //建筑面积
    Call Plugin.chrome.exec_js(id,"$('div[name=mianJi] input').val(99)")
    //楼层
    Call Plugin.chrome.exec_js(id,"$('div[name=params_109] .optiondef').show()")
    //单层
    Call Plugin.chrome.exec_js(id,"$('div[name=params_109] .optiondef li[val=1]').click()")
    Call Plugin.chrome.exec_js(id,"$('div[name=suoZaiLouCeng] #suoZaiLouCeng').val(4)")
    Call Plugin.chrome.exec_js(id,"$('div[name=zongLouCeng] #zongLouCeng').val(6)")
    //面积
    Call Plugin.chrome.exec_js(id,"$('div[name=params_207] input').val(99)")
    //层高
    Call Plugin.chrome.exec_js(id,"$('div[name=params_208] input').val(66)")
    //进深
    Call Plugin.chrome.exec_js(id,"$('div[name=params_209] input').val(11)")
    //是否临街
    Call Plugin.chrome.exec_js(id,"$('div[name=params_211] div[data-value=1]').click()")
    //商铺配套
    Call Plugin.chrome.exec_js(id,"$('div[name=params_110] div[data-value=1]').click()")
    //商铺位置
    //省
    Call Plugin.chrome.exec_js(id,"$('div[name=localArea01] .optiondef').show()")
    Call Plugin.chrome.exec_js(id,"$('div[name=localArea01] .optiondef li[val=1142]').click()")
    //市
    Call Plugin.chrome.exec_js(id,"$('div[name=localDiduan01] .optiondef').show()")
    Call Plugin.chrome.exec_js(id,"$('div[name=localDiduan01] .optiondef li[val=1195]').click()")
    //区
    Call Plugin.chrome.exec_js(id,"$('div[name=xiangXiDiZhi] #xiangXiDiZhi').val('幽幽')")
    //客流人群
    Call Plugin.chrome.exec_js(id,"$('div[name=params_210] div[data-value=1]').click()")
    //售价
    Call Plugin.chrome.exec_js(id,"$('div[name=jiaGe06] #jiaGe06').val('20000')")
    //租金
    Call Plugin.chrome.exec_js(id,"$('div[name=jiaGe05] #jiaGe05').val('20000')")
    Call Plugin.chrome.exec_js(id,"$('div[name=jiageDanwei] .optiondef').show()")
    Call Plugin.chrome.exec_js(id,"$('div[name=jiageDanwei] .optiondef li[val=1]').click()")
    //支付方式
    Call Plugin.chrome.exec_js(id,"$('div[name=params_119] #params_119').val('3')")
    Call Plugin.chrome.exec_js(id,"$('div[name=params_118] #params_118').val('1')")
    //起租期
    Call Plugin.chrome.exec_js(id,"$('div[name=params_116] #params_116').val('1')")
    //免租期
    Call Plugin.chrome.exec_js(id,"$('div[name=params_117] #params_117').val('1')")
    //标题
    Call Plugin.chrome.exec_js(id,"$('div[name=title] #title').val('出租朝阳国贸商业街店铺1')")
    //描述
    Call Plugin.chrome.exec_js(id,"$('#edui1 iframe').contents().find('body').html('<p>（65m2-156m2）多种户型、多种房子、有无家具、房屋买卖、详情咨询、可进店铺\n')")
    //联系人
    Call Plugin.chrome.exec_js(id,"$('div[name=contactName] #contactName').val('王先生')")
    //上传图片
    Call Plugin.chrome.set_file_input_files(id, ".imgUpload input", "d:/temp/1.jpg||d:/temp/2.jpg||d:/temp/3.jpg")
End Function
Function quit()
    MsgBox "脚本执行完毕"
    // 退出浏览器（如果不退出浏览器下次执行"launch"方法用同一个"--user-data-dir"启动参数会启动失败）
    Call Plugin.chrome.quit()
End Function
Function checkChrome()
    HwndEx = Plugin.Window.Search("Google")
    dim MyArray
    MyArray = Split(HwndEx, "|")
    If UBound(MyArray) >= 0 Then
        //        result = MsgBox("是否关闭chrome浏览器？", 1)
        result=1
        If result = 1 Then
            i=0
            For UBound(MyArray)
                Call Plugin.Window.CloseEx(Clng(MyArray(i)))
                i=i+1
            Next
            Delay 300
        Else
            EndScript
        End If
    End If
End Function
Function mySqlConnect()
    mysql  = Plugin.Super_MySQL.mysql_connect("101.201.49.69", "refresh", "Dianzhijia@1", "datarefresh", 3306)
End Function
Function getUser()
    Rem fGetUser
    //获取一条没有被锁定，没有被忽略的房屋信息
    sql = "SELECT * FROM house_list WHERE `block` IS NULL AND username IS NOT NULL ORDER BY RAND( ) LIMIT 1"
    //sql = "SELECT * FROM house_list WHERE username='13477036053' ORDER BY RAND( ) LIMIT 1"
    TracePrint sql
    call Plugin.Super_MySQL.mysql_query(mysql, sql)
    store = Plugin.Super_MySQL.store_result(mysql)
    rows = Plugin.Super_MySQL.num_rows(store)
    If rows > 0 Then
        //读字段
        userName = Plugin.Super_MySQL.fetch_text(store, "username")
        TracePrint "userName:" + userName
        password = Plugin.Super_MySQL.fetch_text(store, "password")
        TracePrint "parrword:"+parrword
        houseListId = Plugin.Super_MySQL.fetch_text(store, "id")
        key = Plugin.Super_MySQL.fetch_text(store, "key")
        url = Plugin.Super_MySQL.fetch_text(store, "url")
        //锁定这条数据
        sql = "UPDATE house_list SET `block`=1 WHERE id=" + houseListId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        //MessageBox userName+"&"+password+"&"+houseListId+"&"+key+"&"+url
        cookie = getCookie(userName)
        TracePrint "cookie:"+cookie
        getUser = Array(userName, password,houseListId,key,url,cookie)
    Else 
        //getUser=Array("-1")
        TracePrint "获取house_list信息异常"
        Goto fGetUser
    End If
End Function
Function getCookie(userName)
    //TODO 
    //    userName="13002422180"
    sql = "SELECT * from cookie where username='" + userName + "'"
    TracePrint sql
    call Plugin.Super_MySQL.mysql_query(mysql, sql)
    store = Plugin.Super_MySQL.store_result(mysql)
    rows = Plugin.Super_MySQL.num_rows(store)
    If rows > 0 Then 
        cookie = Plugin.Super_MySQL.fetch_text(store, "value")
        getCookie=cookie
    Else
        getCookie=""
    End if
End Function
Function setCookie(value)
    TracePrint "setCookie"
    Call execjs("function setCookie(name, value, domain = '58.com', expirationDate) {    var Days = 30;    var exp = new Date();    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);    let cookie = name + '=' + value + ';expires=' + new Date(1575683213 * 1000).toGMTString() + '; path=/;';    if (domain) {        cookie += 'domain=' + domain + ';';    }    console.log(cookie);document.cookie = cookie;};")
    Call execjs("var cookieArr=JSON.parse(decodeURIComponent('" + value + "'))") 
    Call execjs("cookieArr.map(item => {    let {        domain,        name,        value,        expirationDate    } = item;    if (expirationDate) {        setCookie(name, value, null, expirationDate);    }})")
end Function
Function clearAllCookie()
    Call execjs("function clearAllCookie() {var date=new Date();date.setTime(date.getTime()-10000);var keys=document.cookie.match(/[^ =;]+(?=\=)/g);if (keys) { ? ?for (var i = ?keys.length; i--;){document.cookie=keys[i]+'=0; expire='+date.toGMTString()+'; path=/;';document.cookie=keys[i]+'=0; expire='+date.toGMTString()+'; path=/;domain=.58.com';}}}")
    Call execjs("clearAllCookie();")
End Function
//免费刷新：直接刷新			1000
//当天已经刷新过				3001
//发布超过30天：发新帖		3030
//7天内超过4次:重新编辑		3070
//免费刷新用完：不管 			3100
//个人删除 					3404
//需返回修改 				3401
//订单异常					3500
//审核不通过 				3501
//刷新成功 					3502
//刷新失败 					3503
//订单不存在 				3504
//编辑帖子成功 				3505
//编辑帖子失败 				3506
//编辑帖子异常 				3507
//发布帖子成功 				3510
//发布帖子失败 				3511
//发布帖子异常 				3512
//发帖权限已用尽				3513
//本月还可免费发帖			3514
//--------------------------------------
//账户正常					2000
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
        EndScript
    End If
    config=status
End Function
Function main()
    Call mySqlConnect()
    Rem fLogin
    Call start()
    status = login()
    If status = 0 Then 
        status= houseList()
    End If
    call updateStatus(user,status)
    Goto fLogin
End Function
Function loadJquery()
    Rem fLoadJquery
    execjs ("window.$=null;")
    execjs("var script=document.createElement('script');script.type='text/javascript';script.src='//cdn.bootcss.com/jquery/2.1.2/jquery.min.js';document.getElementsByTagName('head')[0].appendChild(script); ")
    count=0
    Do
        Delay 100
        flag = execjs("$===null")
        flag = CBool(flag)
        count=count+1
    Loop While flag and count < 10 * 5
    If flag Then 
        TracePrint "jquery加载失败！重试中..."
        Goto fLoadJquery
    End If
End Function
Function refresh(houseId)
    url = "https://refreshplus.vip.58.com/refreshplus/pc/normalrefreshpage?infoId=" + cstr(houseId) + "&source=1#/immediate"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    Call find("document.querySelectorAll('div').length","查找div")
    Call loadJquery()
    length = find("$('a[href$=immediate]').length", "查找立即刷新a标签")
    rHouseStatus=-456
    If length > 0 Then
        execjs ("$('a[href$=immediate]')[0].click()")
        Delay 500
        Call execjs("var wContent=$('form.form-container.immediate').text().trim().replace(/[\n\s]/g,'')||$('form.yyset').text().trim().replace(/[\s\n]/g,'');")
        Call execjs("function getStatus() {"&_
    					"if (wContent.indexOf('近7天免费刷新已到上限') > -1) {"&_
        					"return 3070"&_
    					"} else if(wContent.indexOf('30天不享有免费刷新') > -1||wContent.indexOf('免费刷新次数已用完，您可尝试付费刷新') > -1) {"&_
        					"return 3030"&_
    					"} else if (wContent.indexOf('本次刷新免费') > -1||/账号剩余刷新资源[^0]/.test(wContent)) {"&_
        					"return 1000"&_
    					"} else {"&_
        					"return -76593"&_
    					"}"&_
					"}")
        rHouseStatus=execjs("getStatus();")
        If rHouseStatus = "" Then 
            rHouseStatus=-7642
        End If
        rHouseStatus=cint(rHouseStatus)
        If rHouseStatus = 1000 Then 
            Call find("$('button:contains(确定刷新)').length", "查找确认刷新按钮")
            Call execjs("$('button:contains(确定刷新)').click();")
            Delay 1000
            rResult = find("$('.result__title-text:contains(立即刷新成功)').length||($('.success-title').text()=='立即刷新成功'?1:0)", "查找刷新成功结果")
            If rResult = "" Then 
                rResult=0
            End If
            rResult = cint(rResult)
            //刷新成功 					3502
            //刷新失败 					3503
            If rResult > 0 Then 
                //刷新成功
                rHouseStatus=3502
            Else 
                //刷新失败
                rHouseStatus=3503
            End If
        ElseIf rHouseStatus = 3070 Then
            //重新编辑
            rHouseStatus = editHouseInfo(houseId)
        ElseIf rHouseStatus = 3030 Then
            //重新发布
            rHouseStatus = addHouseInfo(houseId)
        End If
    End If
    refresh=rHouseStatus
End Function
Function editHouseInfo(houseId)
    Rem rEditHouseInfo
    editStatus=3507
    //获取详情
    url = "https://sy.58.com/shangpu/" + houseId + "x.shtml"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    length = find("$('.house-title h1').length", "查找登录窗口")
    Call execjs("var editData={};"&_
    			"editData.surplusMonth = $('span:contains(剩余租期:)').length?$('span:contains(剩余租期:)').next().text().trim().match(/(\d+)(.*)/)[1]:'';"&_
				"editData.surplusMonthUnit = $('span:contains(剩余租期:)').length?$('span:contains(剩余租期:)').next().text().trim().match(/(\d+)(.*)/)[2]:'';"&_
				"editData.zuJInUnit=$('span.house_basic_title_money_num').length?$('span.house_basic_title_money_num').next().text():'';"&_
				"editData.zuJIn=$('span.house_basic_title_money_num').text();"&_
				"editData.status=$($('.house_basic_title_content').html().replace(/[\n\t]/g,'').replace(/\&nbsp\;/g,'')).find('span:contains(状态)').next().text().trim();"&_
				"editData.title=$('.house-title h1').text().trim().substr(0,30);"&_
				"editData.zrf=$('span.house_basic_title_money_zrf').length?$('span.house_basic_title_money_zrf').text().match(/(\d+)(.*)/)[1]:'';"&_
				"editData.zrfUnit=$('span.house_basic_title_money_zrf').length?$('span.house_basic_title_money_zrf').text().match(/(\d+)(.*)/)[2]:'';")
    editData = execjs("JSON.stringify(editData)")
    TracePrint editData
    length = find("editData&&editData.title?editData.title.length:0","获取title长度")
    If length = "" Then 
        length=0
    End If
    If cint(length) = 0 Then 
        Goto rEditHouseInfo
    End If
    Rem fEditDetailPage
    //回到列表页面点击编辑进入详情编辑页面
    url = "https://fangmypost.58.com/fang/infoall/notabs"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    Call find("$('body .rightside-publish-content .my-item-item').length", "个人中心房产列表")
    Delay 1000
    Call execjs("$('#update" + houseId + "').click();")
    url = "http://post.58.com/fang/update/" + cstr(houseId) + "?PGTID=${window.getGTID()}&ClickID=2"
    TracePrint url
    Call Plugin.chrome.exec_js(id,"$(function(){window.location.href=`"+url+"`})")
    Delay 3000
    length = find("$('#postForm div').length", "获取form下面的div个数，以证明页面渲染完成")
    If length > 0 Then 
        TracePrint "var editData="&editData&";"
        Call execjs("var editData=" & editData & ";")
        Call execjs("$('[name=title] input').val(editData['title']);"&_
					"$('[name=params_205] label:contains(' + editData['status'] + ')').parent().click();"&_
					"$('[name=jiaGe05] input').val(editData['zuJIn']);"&_
					"$('[name=jiageDanwei] .optiondef').show();"&_
					"$('[name=jiageDanwei] .optiondef li:contains(' + editData['zuJInUnit'] + ')').click();"&_
					"$('[name=params_215] input').val(editData['surplusMonth']);"&_
					"$('[name=params_214] input').val(editData['zrf']);")
        //补充楼层
        Call execjs("if($('[name=zongLouCeng] input').val()>1){"&_
					"$('[name=params_109] .optiondef [val=2]').click();"&_
					"var ceng=$('[name=suoZaiLouCeng] input').val()||1"&_
					"$('[name=params_219] input').val(ceng)"&_
					"}else{"&_
					"$('[name=params_109] .optiondef [val=1]').click();"&_
					"}")
        execjs("window.scrollTo(0,99999);")
        Delay 1000
        execjs ("window.scrollTo(0,0);")
        Delay 1000
        execjs ("window.scrollTo(0,99999);")
        Delay 1000
        execjs ("$('.submit_wrap span').trigger('click');")
        Delay 5000
        index = find("document.title.indexOf('息发布成功')","查找发布成功标题")
        If index = "" Then 
            index=-1
        End If
        index = cint(index)
        If index > 0 Then 
            //发布成功
            //MessageBox "发布成功"
            editStatus=3505
        Else 
            TracePrint "重新编辑提交异常"
            Goto rEditHouseInfo
        End If
    Else 
        Goto fEditDetailPage
    End If
    editHouseInfo=editStatus
End Function
Function houseList()
    Rem fHouseList
    //订单列表
    houseStatus=-44
    url = "https://fangmypost.58.com/fang/infoall/notabs"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    length = find("$('body .rightside-publish-content .my-item-item').length","个人中心房产列表")
    If length > 0 Then
        houseId = houseInfo(0)
        TracePrint "houseId:"+houseId
        length = find("$('.my-item-item-header-code:contains(" + houseId + ")').length", "查找是否存在指定房屋id的信息")
        If length > 0 Then 
            Call execjs("var houseItem=$('.my-item-item-header-code:contains(" + houseId + ")').parents('.my-item-item-tb:eq(0)')")
            execjs("var rDate=houseItem.find('p.my-item-item-content-left-date').length?new Date(houseItem.find('p.my-item-item-content-left-date').text().trim()).getTime():0")
            state = execjs("houseItem.attr('state')")
            //===============================================
            //state 
            //显示中:1
            //未实名认证:2
            //===============================================
            If state = "" Then
                state = - 1
            Else
                state=cint(state)
            End If
            If state = 2 Then
                //账户需未实名认证:4001
                houseStatus = 4001
            ElseIf state = - 1  Then
                houseStatus=3502
                MessageBox "未处理异常4564"
            Else 
                Call execjs("var statusContent=houseItem.find('.my-item-item-tb-content-states').text().trim().replace(/\n/g,'').replace(/\s/g,'').substr(0,20)")
                call execjs("function getHouseStatusJs(){"&_
                "if(statusContent.indexOf('显示中')>-1){"&_
                "return 1"&_
                "}else if(statusContent.indexOf('个人删除')>-1){"&_
                "return 3404"&_
                "}else if(statusContent.indexOf('审核不通过')>-1){"&_
                "return 3501"&_
                "}else if(statusContent.indexOf('返回修改')>-1){"&_
                "return 3401"&_
                "}"&_
                "}")
                houseStatus=execjs("getHouseStatusJs();")
            End If
            If houseStatus = 1 Then 
                Call execjs("function isToday(str) {"&_
    						"if (new Date(str).toDateString() === new Date().toDateString()) {"&_
        						"return true;"&_
    						"} else if (new Date(str) < new Date()){"&_
        						"return false;"&_
    						"}"&_
						"}")
                isToday = execjs("isToday(rDate);")
                If isToday = "" Then 
                    isToday=False
                End If
                isToday = CBool(isToday) 
                If isToday = - 1  Then  
                    houseStatus = 3001
                Else 
                    houseStatus = refresh(houseId)
                End If
            End If
        Else 
            houseStatus=3504
            TracePrint "未查找到此条记录"
        End If
    Else 
        houseStatus=-1
        TracePrint "个人中心房产列表获取失败"
        Goto fHouseList
    End If
    houseList=houseStatus
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
    Loop While length = 0 and count < 100
    find=length
End Function
Function findp2(str,c,pageId)
    TracePrint "find   "+c
    TracePrint str
    count = 0
    length=0
    Do
        Delay 150
        length = execjsp2(str,pageId)
        If length = "" Then
            length=0
        End If
        length = CInt(length)
        count = count + 1
        TracePrint count
    Loop While length = 0 and count < 200
    findp2=length
End Function
Function execjsp2(str,pageid)
    TracePrint "execjs: "& str
    result = Plugin.chrome.exec_js(pageid, str)
    TracePrint "result:"&result
    execjsp2=result
End Function
Function execjs(str)
    TracePrint "execjs: "& str
    result = Plugin.chrome.exec_js(id, str)
    TracePrint "result:"&result
    execjs=result
End Function
Function login()
    Call clearAllCookie() 
    user = getUser()
    cookie = user(5)
    If cookie <> "" Then 
        Call setCookie(cookie)
    End If
    Call Plugin.chrome.activate(id)
    Rem fLoadLogin
    Call Plugin.chrome.load(id, "https://passport.58.com/logout")
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    length = find("$('.passwordlogin').length", "查找登录窗口")
    If length > 0 Then
        loginStatus = 0
        //判断登录窗口类型
        Call Plugin.chrome.exec_js(id,"if($('.change_qrcode[type_attr=pclogin]').length){$('.pop_head .qrcode').click()}")
        Delay 500
        Call Plugin.chrome.exec_js(id, "$('#username').val('').focus().val('"+user(0)+"');")
        Call Plugin.chrome.exec_js(id, "$('#password').val('').focus().val('"+user(1)+"');")
        Delay 500
        Call Plugin.chrome.exec_js(id,"verifyobject.isverifyaccount=true;verifyobject.isverifyvalidcode1=true;verifyobject.isverifypwd=true;")
        Call Plugin.chrome.exec_js(id, "$('#btn_account').click();")
        count = 0 
        Do 
            loginStatus = 0
            Delay 500
            result = execjs("$('.password_msg.msg:visible').text()")
            If result <>"" Then
                TracePrint result
                If result="该用户名与密码不符" Then  
                    loginStatus = 4000
                    TracePrint Trim(execjs("$('.password_msg.msg:visible').parent().text()"))
                    Goto fBreakDo
                Else 
                    MessageBox "未处理异常897"
                End If
            End If
            result1 = execjs("$('.write.write58').length||0")
            If result1 = "" Then
                result1=0
            End If
            TracePrint result1
            If CInt(result1) = 1 Then  
                loginStatus =4004
                TracePrint "您的账户存在安全风险"
                Goto fBreakDo
            End If
            url = Plugin.chrome.get_url(id)
            TracePrint url
            count=count+1
        Loop While InStr(url, "my.58.com/index") = 0 and count < 20
        url = Plugin.chrome.get_url(id)
        If InStr(url, "my.58.com/index") = 0 Then 
            //登录页面未处理异常 重新开始
            Goto fLoadLogin
        End If
        Rem fBreakDo
    Else
        Goto fLoadLogin
    End If
    login=loginStatus
End Function
Function updateStatus(userInfo, status)
    Rem fUpdateStatus
    TracePrint  "updateStatus:"&status
    //每次只能更新一个字段
    //获取待插入的id
    sql = "select max(id) as id from `log`"
    TracePrint sql
    Call Plugin.Super_MySQL.mysql_query(mysql, sql)
    store = Plugin.Super_MySQL.store_result(mysql)
    rows = Plugin.Super_MySQL.num_rows(store)
    If rows > 0 Then
        maxId = Plugin.Super_MySQL.fetch_text(store, "id")
        If maxId = "" Then 
            maxId=1
        End If
        maxId = cstr(cint(maxId)+1)
        //insert id 
        sql = "INSERT into log (id) value(" + maxId + ")"
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        Call Plugin.Super_MySQL.num_rows(store)
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
        TracePrint "更新数据失败"
        Goto fUpdateStatus
    End if
End Function
Function start()
    Call Plugin.chrome.quit()
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
        page2 = Plugin.chrome.create()
    End if
End Function
Function object()
    Dim o
    Set o = CreateObject("Scripting.Dictionary")
    o.Add "hash", "1"
    MessageBox o.Item("hash")
    object=1
End Function
Function loadScript(name)
    Rem fLoadScript
    Call execjs("window.getHouseDetail=null;")
    Call execjs("var script=document.createElement('script');script.type='text/javascript';script.src='//wlasd4622.github.io/lcx58/common/58.js';document.getElementsByTagName('head')[0].appendChild(script); ")
    count=0
    Do
        Delay 100
        flag = execjs("getHouseDetail!==null")
        flag = CBool(flag)
        count = count + 1
        TracePrint "count:"&count
    Loop While flag and count < 10 * 3
    If flag Then 
        TracePrint "script加载失败！重试中..."
        Goto fLoadScript
    End If
End Function
Function addHouseInfo(houseId)
    //发布帖子成功 				3510
    //发布帖子失败 				3511
    //发布帖子异常 				3512
    Rem rAddHouseInfo
    addStatus=3511
    //获取详情
    url = "https://sy.58.com/shangpu/" + houseId + "x.shtml"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    length = find("$('.house-title h1').length", "查找登录窗口")
    Call loadScript("58")
    Delay 100
    hosueDetailCode=""
    hosueDetailCode = execjs("getHouseDetail();")
    If hosueDetailCode = "" Then 
        Goto rAddHouseInfo
    End If
    codeKey=execjs("$('a.house_basic_title_content_item3.blue-link:eq(0)').attr('href').match(/\w*.*?\.com/)[0].replace('//','')")
    code = queryCode(codeKey)
    //回到列表页面点击编辑进入详情编辑页面
    url = "https://fangmypost.58.com/fang/infoall/notabs"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    Call find("$('body .rightside-publish-content .my-item-item').length", "个人中心房产列表")
    Delay 1000
    //发布信息
    Call Plugin.chrome.exec_js(id,"$(function(){window.location.href=`https://post.58.com/fang/"+cstr(code)+"/14/s5?PGTID=${window.getGTID()}&ClickID=2`})")
    // 等待载入完成
    Delay 500
    Call find("$('.submit_wrap').length", "查找发布按钮")
    Call loadScript("58")
    Delay 500
    Call find("$('.paytips').length","查找发布页面消息信息")
    addStatus = execjs("getAddHosueInfoStatus();")
    If cint(addStatus) = 3514 Then 
        //发帖
        Call execjs("addHouseInfoData(`" + hosueDetailCode + "`);")
        picStr=execjs("houseDetailData.picList")
        //下载图片
        picList = Split(picStr, "|")
        Call dowloadImage(picList)
        picStr = getPicStr(picList)
        //上传图片
        Call Plugin.chrome.set_file_input_files(id, ".imgUpload input", picStr)
        Rem fUpdaaImage
        length = find("($('.img_box').length===$('.img_box[draggable=true]').length)?1:0", "检查图片是否上传完毕")
        If length > 0 Then 
            execjs ("$('.submit_wrap span').trigger('click');")
            Delay 5000
            index = find("document.title.indexOf('息发布成功')","查找发布成功标题")
            If index = "" Then 
                index=-1
            End If
            index = cint(index)
            If index > 0 Then
                addStatus=3510
                MessageBox "发布成功"
            Else 
                MessageBox "发布失败"
                addStatus=3511
            End If
        Else 
            Goto fUpdaaImage
        End If
    Else 
        //本月无法发帖
        MessageBox "本月无法发帖"
    End If
    MessageBox addStatus
    addHouseInfo=addStatus
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
        i=0
        For UBound(MyArray)
            Call Plugin.Window.CloseEx(Clng(MyArray(i)))
            i=i+1
        Next
        Delay 300
    End If
End Function
Function mySqlConnect()
    mysql  = Plugin.Super_MySQL.mysql_connect("101.201.49.69", "refresh", "Dianzhijia@1", "datarefresh", 3306)
End Function
Function getUser()
    Rem fGetUser
    //获取一条没有被锁定，没有被忽略的房屋信息
    sql = "SELECT * FROM house_list WHERE `block` IS NULL AND username IS NOT NULL ORDER BY RAND( ) LIMIT 1"
    sql = "SELECT * FROM house_list WHERE `username`='17844667405' ORDER BY RAND( ) LIMIT 1"
    TracePrint sql
    Call Plugin.Super_MySQL.mysql_query(mysql, sql)
    store = Plugin.Super_MySQL.store_result(mysql)
    rows = Plugin.Super_MySQL.num_rows(store)
    If rows > 0 Then
        //读字段
        houseListId = Plugin.Super_MySQL.fetch_text(store, "id")
        userName = Plugin.Super_MySQL.fetch_text(store, "username")
        TracePrint "userName:" + userName
        password = Plugin.Super_MySQL.fetch_text(store, "password")
        TracePrint "parrword:" + parrword
        key = Plugin.Super_MySQL.fetch_text(store, "key")
        url = Plugin.Super_MySQL.fetch_text(store, "url")
        //锁定这条数据
        sql = "UPDATE house_list SET `block`=1 WHERE id=" + houseListId
        TracePrint sql
        Call Plugin.Super_MySQL.mysql_query(mysql, sql)
        If password = "" Then 
            Goto fGetUser
        End If
        cookie = getCookie(userName)
        TracePrint "cookie:" + cookie
        houseId = getHouseId(url)
        houseInfo=Array(houseId)
        getUser = Array(userName, password,houseListId,key,url,cookie)
    Else 
        //getUser=Array("-1")
        TracePrint "获取house_list信息异常"
        Goto fGetUser
    End If
End Function
Function getCookie(userName)
    Text = Plugin.File.ReadFileEx("d:\cookie\"+userName+".txt")
    dim MyArray
    MyArray = Split(Text, "|")
    cookieValue=""
    If UBound(MyArray)>=0 Then
        i=0
        For UBound(MyArray)
            //下面这句是得到文本内容
            cookieValue=cookieValue+ Cstr(MyArray(i))
            i=i+1
        Next
    End If
    TracePrint cookieValue
    getCookie = cookieValue 
End Function
Function setCookie(value)
    Call Plugin.chrome.activate(page2)
    TracePrint "setCookie"
    Call execjsp2("$('#pasteButton').click()", page2)
    Call findp2("$('#pasteCookie textarea:visible').length", "find textarea", page2)
    Call Plugin.Sys.SetCLB(value)
    MoveTo 606, 294
    Delay 300
    LeftClick 2
    Delay 300
    KeyDown 17, 1
    KeyPress 86, 1
    KeyUp 17, 1
    Delay 300
    Call execjsp2("$('#submitButton').click()", page2)
    Delay 2000
end Function
Function clearAllCookie()
    Call Plugin.chrome.activate(page2)
    url = "chrome-extension://fngmhnnpilhplaeedifhccceomclgfbg/popup.html?url=http://passport.58.com&id=-1&incognito=false"
    Call Plugin.chrome.load(page2, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    Call findp2("$('#cookieSearchCondition:visible').length", "查找页面元素",page2)
    Delay 1000 
    Call execjsp2("$('#deleteAllButton')[0].click()",page2)
    Call findp2("$('#noCookies:contains(没有cookie记录)').length", "没有cookie记录！",page2)
End Function
Function getHouseId(url)
    regstr = url
    regin1 = Instr(regstr, "shangpu/")
    regin2 = Instr(regstr, "x.shtm")
    regl1 = Len("shangpu/")
    regr1 = Mid(regstr, regin1 + regl1, regin2 - regin1 - regl1)
    getHouseId=regr1
End Function
Function queryCode(key)
    Rem fQueryCode
    code=-1
    TracePrint "queryCode:" & key
    sql = "SELECT * FROM `code` WHERE `key`='"+key+"'"
    TracePrint sql
    Call Plugin.Super_MySQL.mysql_query(mysql, sql)
    store = Plugin.Super_MySQL.store_result(mysql)
    rows = Plugin.Super_MySQL.num_rows(store)
    If rows > 0 Then 
        code = Plugin.Super_MySQL.fetch_text(store, "code")
        If code = "" Then 
            code =-1
        End If
    End If
    If code = - 1  Then  
        Call Plugin.chrome.activate(page2)
        Rem fGetCodePage
        url = "https://" & key
        TracePrint url
        Call Plugin.chrome.load(page2,url)
        // 等待载入完成
        Do
            Delay 10
        Loop While Plugin.chrome.is_loading(page2)
        length = findp2("$('#fabu').length", "查找发布按钮",page2)
        If length > 0 Then 
            code = execjsp2("$('#fabu').attr('href').match(/\d+/g).pop()", page2)
            If code = "" Then 
                code=-1
            End If
            code = cint(code)
            If code <> - 1  Then 
                Call addCode(key,cstr(code))
            End If
        Else 
            Goto fGetCodePage
        End If
    End If
    If code = - 1  Then 
        Goto fQueryCode
    End If
    Call Plugin.chrome.activate(id)
    queryCode=code
End Function
Function addCode(key, code)
    TracePrint "addCode:"&key&"-"&code
    //每次只能更新一个字段
    //获取待插入的id
    sql = "select max(id) as id from `code`"
    TracePrint sql
    Call Plugin.Super_MySQL.mysql_query(mysql, sql)
    store = Plugin.Super_MySQL.store_result(mysql)
    rows = Plugin.Super_MySQL.num_rows(store)
    If rows > 0 Then
        maxId = Plugin.Super_MySQL.fetch_text(store, "id")
        If maxId = "" Then 
            maxId=1
        End If
        maxId = cstr(cint(maxId)+1)
        //insert id 
        sql = "INSERT into `code` (id) value(" + maxId + ")"
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        Call Plugin.Super_MySQL.num_rows(store)
        //update key
        sql = "UPDATE `code` SET `key`='" + key + "' WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        //update code
        sql = "UPDATE `code` SET `code`='" + code + "' WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
    End if
End Function
Function getPicStr(list)
    resultStr=""
    For Each url In list//For Each遍历数组B中的元素A
        fileName = Plugin.Encrypt.Md5String(url)
        resultStr=resultStr+"d:\58images\"+fileName+".png"+"||"
    Next
    length=len(resultStr)
    resultStr=Mid(resultStr,1,length-2)
    TracePrint resultStr
    getPicStr=resultStr
End Function
Function dowloadImage(list)
    For Each url In list//For Each遍历数组B中的元素A
        fileName=Plugin.Encrypt.Md5String(url)
        Set obj1 = CreateObject("msxml2.xmlhttp")
        Set obj2 = CreateObject("adodb.stream")
        obj1.open "get",url,False
        obj1.send
        temp = obj1.responseBody
        obj2.Type = 1
        obj2.Mode = 3
        obj2.Open
        obj2.Write(temp)
        obj2.SaveToFile "d:\58images\"+fileName+".png",2 //2的意思是已有则覆盖,后面是保存路径。
        obj2.Close 
    Next
End Function
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
//js发帖未处理异常			3521
//js发帖正常					3522
//租金为空					3523
//电话校验回填验证码			3524
//上传的图片小于5K			3525
//--------------------------------------
//账户正常					2000
//密码错 					4000
//未实名认证 				4001
//认证超时 					4002
//用户名不存在				4003
//账户异常					4004
//账户需要设置cookie			4005
//--------------------------------------
Dim id, chromeSrc, mysql,houseInfo,userInfo
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
    newUrl = ""
    isSleep = sleep()
    If isSleep = - 1  Then
        TracePrint "休眠中..."
        Delay 60000
        Goto fLogin
    End If
    Call start()
    status = login()
    If status = 0 Then
        status= houseList()
    End If
    call updateStatus(user,status)
    Goto fLogin
End Function
//休眠-1
//非休眠 0
Function sleep()
    status=true
    currHour = Hour(now)
    If (currHour >= 0 and currHour<4) or (currHour >= 8 and currHour<20) Then
        status=false
    Else
        status=true
    End If
    sleep=cint(status)
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
    					"if (wContent.indexOf('近7天免费刷新已到上限') > -1||wContent.indexOf('帖子浏览量大于') > -1) {"&_
        					"return 3070"&_
    					"} else if(wContent.indexOf('30天不享有免费刷新') > -1||wContent.indexOf('免费刷新次数已用完，您可尝试付费刷新') > -1) {"&_
        					"return 3030"&_
    					"} else if (wContent.indexOf('本次刷新免费') > -1||/账号剩余刷新资源[^0]/.test(wContent)) {"&_
        					"return 1000"&_
    					"} else {"&_
        					"return -793"&_
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
    editCount=0
    Rem rEditHouseInfo
    editStatus=3507
    //获取详情
    url = "https://sy.58.com/shangpu/" + houseId + "x.shtml"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    length = find("$('.house-title h1').length", "查找详情页标题")
    If length = "" Then
        length=0
    End If
    If cint(length) = 0 Then
        //页面异常
        length = execjs("$('h1:visible:contains(您访问的页面居然不存在)').length")
        If cint(length) > 0 Then
            editStatus = 3507
            Goto rBreak
        End If
    End If
    Call loadScript("58")
    Delay 1000
    hosueDetailCode=""
    hosueDetailCode = execjs("getHouseDetail();")
    If hosueDetailCode = "" Then
        TracePrint "未处理异常1146"
        Goto rEditHouseInfo
    End If
    Call execjs("var editData={};"&_
    			"editData.surplusMonth = $('span:contains(剩余租期:)').length?$('span:contains(剩余租期:)').next().text().trim().match(/(\d+)(.*)/)[1]:'';"&_
				"editData.surplusMonthUnit = $('span:contains(剩余租期:)').length?$('span:contains(剩余租期:)').next().text().trim().match(/(\d+)(.*)/)[2]:'';"&_
				"editData.zuJInUnit=$('span.house_basic_title_money_num').length?$('span.house_basic_title_money_num').next().text():'';"&_
				"editData.zuJIn=$('span.house_basic_title_money_num').text();"&_
				"editData.status=$($('.house_basic_title_content').html().replace(/[\n\t]/g,'').replace(/\&nbsp\;/g,'')).find('span:contains(状态)').next().text().trim();"&_
				"editData.title=$('.house-title h1').text().replace(/\(转让\)/g,'').replace(/\(出租\)/g,'').replace(/\(出售\)/g,'').trim().substr(0,30);"&_
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
        Delay 200
        //补充楼层
        js="function changeStatus(){"&_
        				"var title=$('[name=params_109] .title').text().trim();"&_
						"$('[name=params_109] li:eq(0)').click();"&_
						"$('[name=params_109] li:contains('+title+')').click();"&_
						"if($('[name=params_219] input').val()==$('[name=suoZaiLouCeng] input').val()){"&_
							"$('[name=params_109] li:eq(1)').click();"&_
						"}"&_
        			"}"
        TracePrint js
        Call execjs(js)
        Call execjs("changeStatus()")
        Call execjs("window.houseDetailData = JSON.parse(decodeURIComponent(`"+hosueDetailCode+"`));")
        //经营行业
        Call execjs("if (houseDetailData.industry == '家居建材') {"&_
    					"houseDetailData.industry = '家具建材'"&_
    				"}"&_
    				"$('[name=params_22701] .optiondef li:contains(' + houseDetailData.industry + ')').click();"&_
    				"$('[name=params_20601] .optiondef li:eq(1)').click();")
        //物业费
        Call execjs("if($('[name=params_218] input').val()==0){"&_
					"	$('[name=params_218] input').val('').blur();"&_
					"}")
        //售价
        Call execjs("if ($('[name=jiaGe06] input:visible') && !$('[name=jiaGe06] input:visible').val()) {"&_
      				"$('[name=jiaGe06] input:visible').val(houseDetailData.moneyNum || 1);"&_
    				"}")
        //转让费，剩余租期
        //    	Call execjs("if (houseDetailData.title.indexOf('(转让)') > -1) {"&_
//      					"$('[name=fenlei] [data-value=511571]').click();"&_
//      					"if (!houseDetailData.transferFee || houseDetailData.transferFee < 1) {"&_
//        				"	houseDetailData.transferFee = 1"&_
//      					"}"&_
//      					"$('[name=params_214] input').val(houseDetailData.transferFee);"&_
//      					"$('[name=params_215] input').val(houseDetailData.endMonth||1);"&_
//    					"} else if (houseDetailData.title.indexOf('(出租)') > -1) {"&_
//      					"$('[name=fenlei] [data-value=511570]').click();"&_
//      					"$('[name=type] [data-value=2]').click();"&_
//    					"} else if (houseDetailData.title.indexOf('(出售)') > -1) {"&_
//      					"$('[name=fenlei] [data-value=511570]').click();"&_
//      					"$('[name=type] [data-value=0]').click();"&_
//    				"};")
        Delay 200
        execjs("window.scrollTo(0,99999);")
        Delay 1000
        execjs ("window.scrollTo(0,0);")
        Call execjs("$('input').click();")
        Delay 1000
        execjs ("window.scrollTo(0,99999);")
        Delay 1000
        execjs ("$('.submit_wrap span').trigger('click');")
        Delay 2500
        Delay 2500
        length = execjs("$('.tip:contains(详细地址不能为空):visible').length||0")
        If length = "" Then
            length=0
        End If
        If cint(length) > 0 Then
            editStatus = 3507
            Goto rBreak
        End If
        index = find("document.title.indexOf('息发布成功')", "查找发布成功标题")
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
            editCount = editCount + 1
            If editCount > 3 Then
                editStatus=3507
            Else
                Goto rEditHouseInfo
            End If
        End If
    Else
        Goto fEditDetailPage
    End If
    Rem rBreak
    //MessageBox editStatus
    editHouseInfo=editStatus
End Function
Function houseList()
    Rem fHouseList
    TracePrint "func:houseList"
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
                TracePrint "未处理异常4564"
                Goto fHouseList
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
        length = execjs("$('div.tip-none:contains(您还没有发布信息):visible').length||0")
        If cint(length) > 0 Then
            TracePrint "订单不存在"
            houseStatus = 3504
        Else
            TracePrint "个人中心房产列表获取失败"
            Goto fHouseList
        End If
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
    loginCount=0
    messages=""
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
            result = execjs("$('.password_msg.msg:visible').text().trim()||$('.validcode_msgtext:visible').text().trim()")
            If result <>"" Then
                TracePrint result
                messages=execjs("encodeURIComponent('"+result+"');")
                If result="该用户名与密码不符" Then
                    loginStatus = 4000
                    TracePrint Trim(execjs("$('.password_msg.msg:visible').parent().text()"))
                    Goto fBreakDo
                ElseIf result = "该用户不存在" Then
                    loginStatus = 4003
                    TracePrint Trim(execjs("$('.password_msg.msg:visible').parent().text()"))
                    Goto fBreakDo
                ElseIf result = "请输入图片验证码" Then
                    loginStatus = 4004
                    TracePrint result
                    Goto fBreakDo
                Else
                    loginStatus = 4004
                    TracePrint "登录，未处理异常"
                    Goto fBreakDo
                End If
            End If
            result1 = execjs("$('.write.write58').length||0")
            If result1 = "" Then
                result1=0
            End If
            TracePrint result1
            If CInt(result1) = 1 Then
                loginStatus = 4004
                messages=execjs("encodeURIComponent('您的账户存在安全风险');")
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
    If loginStatus=4000 and loginCount < 4 Then
        loginCount=loginCount+1
        Goto fLoadLogin
    End If
    login=loginStatus
End Function
Function updateStatus(userInfo, status)
    Rem rUpdateStatus
    Call loadScript("58")
    Delay 500
    flag = execjs("typeof window.updateHouseInfo==='undefined'?0:1")
    If flag = "" Then
        flag=0
    End If
    If cint(flag) = 0 Then
        Goto rUpdateStatus
    End If
    js="updateHouseInfo('"+cstr(userInfo(3))+"',  "+cstr(status)+",'"+newUrl+"')"
    //MessageBox js
    Call execjs(js)
    Delay 500
    result = execjs("window.updateHouseInfoStatus")
    If result = "更新错误" Then
        MessageBox "更新错误"
    End If
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
        Call Plugin.Super_MySQL.num_rows(store)
        //update messages
        sql = "UPDATE log SET `messages`='" + cstr(messages) + "' WHERE id=" + maxId
        TracePrint sql
        Call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        Call Plugin.Super_MySQL.num_rows(store)
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
    End If
    //得到当前最前面的窗口句柄
    Hwnd = Plugin.Window.Foreground()
    //延时200毫秒
    delay 200
    //最大化窗口
    Call Plugin.Window.Max(Hwnd)
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
    Call execjs("var script=document.createElement('script');script.type='text/javascript';script.async = true;script.defer = true;script.src='https://wlasd4622.github.io/lcx58/common/58.js?v='+Date.now();document.getElementsByTagName('head')[0].appendChild(script); ")
    count=0
    Do
        Delay 100
        flag = execjs("getHouseDetail!==null")
        If flag = "" Then
            flag=False
        End If
        flag = CBool(flag)
        count = count + 1
        TracePrint "count:"&count
    Loop While flag = 0 and count < 30
    If flag=0 Then
        TracePrint "script加载失败！重试中..."
        Goto fLoadScript
    End If
End Function
Function addHouseInfo(houseId)
    //发布帖子成功 				3510
    //发布帖子失败 				3511
    //发布帖子异常 				3512
    Rem rAddHouseInfo
    newUrl=""
    addStatus=3511
    //获取详情
    url = "https://sy.58.com/shangpu/" + houseId + "x.shtml"
    TracePrint url
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    length = find("$('.house-title h1').length", "查找详情页标题")
    errorPage = execjs("location.href.includes('404.htm')?1:0")
    If cint(errorPage) = 1 Then
        //404
        addStatus=3404
        Goto rBreak
    End If
    Call loadScript("58")
    Delay 100
    hosueDetailCode=""
    hosueDetailCode = execjs("getHouseDetail();")
    If hosueDetailCode = "" Then
        Goto rAddHouseInfo
    End If
    codeKey=execjs("$('a.house_basic_title_content_item3.blue-link:eq(0)').attr('href').match(/\w*.*?\.com/)[0].replace('//','')")
    code = queryCode(codeKey)
    Rem rNotabsPage
    //回到列表页面点击编辑进入详情编辑页面
    url = "https://fangmypost.58.com/fang/infoall/notabs"
    Call Plugin.chrome.load(id, url)
    // 等待载入完成
    Do
        Delay 10
    Loop While Plugin.chrome.is_loading(id)
    length = find("$('body .rightside-publish-content .my-item-item').length", "个人中心房产列表")
    If length = 0 Then
        Goto rNotabsPage
    End If
    Rem rPostPage
    Delay 1000
    //发布信息
    Rem fJsAddpage
    js = "window.location.href=`https://post.58.com/fang/" + cstr(code) + "/14/s5?PGTID=${window.getGTID()}&ClickID=2`"
    TracePrint js
    Call Plugin.chrome.exec_js(id,js)
    // 等待载入完成
    Delay 1500
    length = find("$('.submit_wrap').length", "查找发布按钮")
    If length = 0 Then
        Goto fJsAddpage
    End If
    Call loadScript("58")
    Delay 500
    length = find("$('.paytips').length", "查找发布页面消息信息")
    If length=0 Then
        Goto rPostPage
    End If
    Call find("$('.paytips').length","查找paytips")
    addStatus = execjs("getAddHosueInfoStatus();")
    If addStatus = "" Then
        addStatus=-44
    End If
    If cint(addStatus) = 3514 Then
        //发帖
        addStatus = execjs("addHouseInfoData(`" + hosueDetailCode + "`,'" + userInfo(0) + "');")
        If addStatus = "" Then
            addStatus=3521
        End If
        If cint(addStatus) = 3521 Then
            //js发帖未处理异常
            MessageBox "js发帖未处理异常"
            Goto rPostPage
        ElseIf cint(addStatus) = 3522 Then
            //js发帖正常
            TracePrint "js发帖正常"
        ElseIf cint(addStatus) = 3523 Then
            //租金为空
            Goto fMoneyNumEmit
        End If
        picStr=execjs("houseDetailData.picList")
        //下载图片
        picList = Split(picStr, "|")
        Call dowloadImage(picList)
        picStr = getPicStr(picList)
        //上传图片
        Call Plugin.chrome.set_file_input_files(id, ".imgUpload input", picStr)
        Rem fUpdaaImage
        length = find("(houseDetailData.picList.split('|').length===$('.img_box[draggable=true]').length?1:0)", "检查图片是否上传完毕")
        If length > 0 Then
            Rem rSubmit
            imageCount = execjs("$('.img_box[draggable=true]').length")
            TracePrint "图片总数:"&imageCount
            Delay 2000
            execjs ("$('.submit_wrap span').trigger('click');")
            Delay 1000
            resultMsg = execjs("$('[name=yzm]:visible').prev().text()||''")
            resultMsg1=execjs("$('h2:contains(完成实名认证):visible').length||0")
            If resultMsg = "电话校验回填验证码" Then
                TracePrint "电话校验回填验证码"
                editStatus = 3524
                Goto rBreak
            End If
            If cint(resultMsg1) > 0 Then
                TracePrint "未实名认证"
                editStatus = 4001
                Goto rBreak
            End If
            Delay 2000
            index = find("document.title.indexOf('息发布成功')", "查找发布成功标题")
            If index = "" Then
                index=-1
            End If
            index = cint(index)
            If index > 0 Then
                Rem rGetResultUrl
                length = find("$('.p_active_btn').length", "查找查看信息按钮")
                If length = 0 Then
                    //没有获取到新发布的帖子编号，重试中...
                    TracePrint "没有获取到新发布的帖子编号，重试中..."
                    call Plugin.chrome.stop(id)
                    Delay 500
                    Call Plugin.chrome.reload(id)
                    Delay 3000
                    Goto rGetResultUrl
                End If
                addStatus = 3510
                newUrl = execjs("'http:'+$('.p_active_btn').attr('href').replace(/^http\w{0,1}\:/,'')")
                If newUrl = "" Then
                    MessageBox "url为空"
                End If
                Call addNewHouseInfo(newUrl)
            Else
                TracePrint "发布失败"
                Goto rAddHouseInfo
            End If
        Else
            length = execjs("$('div:contains(上传的图片小于):visible').length||0")
            If cint(length)>0 Then
                addStatus = 3525
                Goto rSubmit
            End If
            Goto fUpdaaImage
        End If
    ElseIf cint(addStatus) = 3513 Then
        TracePrint addStatus
        TracePrint "发帖权限已用尽"
    Else
        TracePrint addStatus
        TracePrint "状态异常"
        Goto rPostPage
    End If
    Rem fMoneyNumEmit
    Rem rBreak
    TracePrint houseInfo(0)
    //MessageBox addStatus
    addHouseInfo=addStatus
End Function
Function addNewHouseInfo(url)
    Rem fAddNewHouseInfo
    //每次只能更新一个字段
    //获取待插入的id
    sql = "select max(id) as id from `house_info`"
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
        sql = "INSERT into house_info (id) value(" + maxId + ")"
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        Call Plugin.Super_MySQL.num_rows(store)
        //update url
        sql = "UPDATE house_info SET `url`='" + url + "' WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        call Plugin.Super_MySQL.num_rows(store)
        //update house_key
        sql = "UPDATE house_info SET `house_key`='" + cstr(userInfo(3)) + "' WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        Call Plugin.Super_MySQL.num_rows(store)
        //update old_url
        sql = "UPDATE house_info SET `old_url`='" + cstr(userInfo(4)) + "' WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        call Plugin.Super_MySQL.num_rows(store)
        //update create_date
        sql = "UPDATE house_info SET `create_date`=now() WHERE id=" + maxId
        TracePrint sql
        call Plugin.Super_MySQL.mysql_query(mysql, sql)
        store = Plugin.Super_MySQL.store_result(mysql)
        call Plugin.Super_MySQL.num_rows(store)
    Else
        TracePrint "更新数据失败"
        Goto fAddNewHouseInfo
    End if
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
    sql = "START TRANSACTION"
    TracePrint sql
    Call Plugin.Super_MySQL.mysql_query(mysql, sql)
    store = Plugin.Super_MySQL.store_result(mysql)
    sql = "SELECT * FROM house_list WHERE `block` IS NULL AND username IS NOT NULL ORDER BY RAND( ) LIMIT 1 FOR UPDATE"
    //sql = "SELECT * FROM house_list WHERE `username`='18602431993' ORDER BY RAND( ) LIMIT 1 FOR UPDATE"
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
        sql = "commit"
        TracePrint sql
        Call Plugin.Super_MySQL.mysql_query(mysql, sql)
        If password = "" Then
            Goto fGetUser
        End If
        cookie = getCookie(userName)
        TracePrint "cookie:" + cookie
        houseId = getHouseId(url)
        houseInfo = Array(houseId)
        userInfo=Array(userName, password,houseListId,key,url,cookie)
        getUser =userInfo
    Else
        sql = "commit"
        TracePrint sql
        Call Plugin.Super_MySQL.mysql_query(mysql, sql)
        //getUser=Array("-1")
        TracePrint "没有获取到数据"
        Delay 5000
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
    value = Replace(value, "\""","\\""")
    TracePrint value
    Call execjsp2("$('#pasteCookie textarea:visible').val(`"+value+"`)", page2)
    Delay 300
    Call execjsp2("$('#submitButton').click()", page2)
    Delay 2000
end Function
Function clearAllCookie()
    Call Plugin.chrome.activate(page2)
    call Plugin.chrome.clear_browser_cache(id)
    call Plugin.chrome.clear_browser_cookies(id)
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

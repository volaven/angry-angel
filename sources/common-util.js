﻿﻿﻿﻿﻿﻿//######################### String관련 시작 #########################
/**
 * 글자 바이트 제한
 * param : this
 * param2 : 최대입력수
 * param3 : 입력한 글자수 표현할 ID 값
 */
function fn_strBytechk(obj,msgLimit,tarGet){
	var str = obj.value;
	var str_len = str.length;

	var bytes = 0;
	var len = 0;
	var chars = "";
	var str2 = "";

	for(var i=0;i < str_len; i++){
		chars = str.charAt(i);
		if(escape(chars).length > 4){
			bytes += 2;
		}else{
			bytes++;
		}

		if(bytes <= msgLimit){
			len = i + 1;
		}
	}

	if(bytes > Number(msgLimit)){
		alert(msgLimit+"자를 초과할수 없습니다.");
		str2 = str.substr(0,len);
		obj.value = str2;
		fn_strBytechk(obj,msgLimit,tarGet);
	}else{
		if(tarGet == ""){

		}else{
			$("#"+tarGet).html("<font color='red'>"+bytes+"</font>");
		}

	}
}




//왼쪽 공백문자 제거(별로 안좋아보이므로 담에 다시 바꾸자)
function fnLtrim(strValue) {
    try {
        while (strValue.length > 0) {
            if (strValue.charAt(0) == ' ') {
                strValue = strValue.substring(1, strValue.length);
            }
            else {
                return strValue;
            }
        }
        return strValue;
    }
    catch (e) {
        alert(e.description);
    }
}

//오른쪽 공백문자 제거(별로 안좋아보이므로 담에 다시 바꾸자)
function fnRtrim(strValue) {
    try {
        while (strValue.length > 0) {
            if (strValue.charAt(strValue.length - 1) == ' ') {
                strValue = strValue.substring(0, strValue.length - 1);
            }
            else {
                return strValue;
            }
        }
        return strValue;
    }
    catch (e) {
        alert(e.description);
    }
}

//String 의 공백을 모두 제거한다.
function fnTrim(sourceString) {
    var strResult;
    try {
        strResult = sourceString.replace(/\s/g, "");
        return strResult;
    }
    catch (e) {
        alert(e.description);
    }
}

//String 의 양쪽공백을 모두 제거한다.
function fnRLTrim(strSource) {
    try {
        return strSource.replace(/(^\s*)|(\s*$)/g, "");
    }
    catch (e) {
        alert(e.description);
    }
}

//문자열 바꿈
function fnReplaceAll(oldStr, findStr, repStr) {
    try {
        var srchNdx = 0;
        var newStr = "";
        while (oldStr.indexOf(findStr, srchNdx) != -1) {
            newStr += oldStr.substring(srchNdx, oldStr.indexOf(findStr, srchNdx));
            newStr += repStr;
            srchNdx = (oldStr.indexOf(findStr, srchNdx) + findStr.length);
        }
        newStr += oldStr.substring(srchNdx, oldStr.length);
        return newStr;
    }
    catch (e) {
        alert(e.description);
    }
}

//html 태그(<로 시작해서 >로 닫히는 문자열) 제거
function skip_html(string) {
    try {
        var objStrip = new RegExp();
        objStrip = /[<][^>]*[>]/gi;
        return string.replace(objStrip, "");
    }
    catch (e) {
        alert(e.description);
    }
}

//문자열 길이제한을 체크한다.
//str - 입력문자
//limit - 한계개수
function fnCheckStringLength(str, limit) {
    try {
        if (str.length >= limit)
            event.returnValue = false;
    }
    catch (e) {
        alert(e.description);
    }
}

//특수문자만 체크하여 입력된다.
function fnCheckSpecialString() {
    try {
        //소문자 || 대문자 || 숫자
        if ((window.event.keyCode >= 97 && window.event.keyCode <= 122) || (window.event.keyCode >= 65 && window.event.keyCode <= 90) || (window.event.keyCode >= 48 && window.event.keyCode <= 57))
            event.returnValue = false;
    }
    catch (e) {
        alert(e.description);
    }
}

//특수문자만 체크하여 입력안된다.
function fnCheckSpecialNoString() {
    try {
        //소문자 || 대문자 || 숫자 || 기타
        if (window.event.keyCode == 95 ||
		    window.event.keyCode == 45 ||
		    (window.event.keyCode >= 97 && window.event.keyCode <= 122) ||
		    (window.event.keyCode >= 65 && window.event.keyCode <= 90) ||
		    (window.event.keyCode >= 48 && window.event.keyCode <= 57) ||
		    window.event.keyCode == 32)
            event.returnValue = true;
        else
            event.returnValue = false;
    }
    catch (e) {
        alert(e.description);
    }
}

//특수문자만 체크하여 입력안된다.
function fnCheckSpecialNoStringUser() {
    try {
        //소문자 || 대문자 || 숫자 || 기타
        if (window.event.keyCode == 95 ||
		    window.event.keyCode == 45 ||
		    (window.event.keyCode >= 97 && window.event.keyCode <= 122) ||
		    (window.event.keyCode >= 65 && window.event.keyCode <= 90) ||
		    (window.event.keyCode >= 48 && window.event.keyCode <= 57) ||
		    window.event.keyCode == 32 ||
		    window.event.keyCode == 40 || window.event.keyCode == 41 || window.event.keyCode == 91 || window.event.keyCode == 93 ||
		    window.event.keyCode == 47 || window.event.keyCode == 45 || window.event.keyCode == 95)
            event.returnValue = true;
        else
            event.returnValue = false;
    }
    catch (e) {
        alert(e.description);
    }
}

//영문자와 숫자만 입력받는다.
function fn_OnlyEngNum(values) {
    try {
        var strValid = "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789" // 유효한 값
        var bCheck = true;
        var temp;

        for (var i = 0; i < values.length; i++) {
            temp = "" + values.substring(i, i + 1);
            if (strValid.indexOf(temp) == "-1")
                bCheck = false;
        }
        return bCheck;
    }
    catch (e) {
        alert(e.description);
    }
}

//숫자만 입력받는다.
function fnOnlyEngNum(inputValue) {
	alert(1)
    try {
        var strValid = "0123456789" // 유효한 값
        var bCheck = true;
        var temp;

        for (var i = 0; i < inputValue.length; i++) {
            temp = "" + inputValue.substring(i, i + 1);
            if (strValid.indexOf(temp) == "-1")
                bCheck = false;
        }
        return bCheck;
    }
    catch (e) {
        alert(e.description);
    }
}

//메일 주소들 체크
//ex)"테스트"<jaeils@jcubei.com>;"test"<jaeils@jcubei.com>,jaeils@jcubei.com;
function fnCheckEmail(strAddr) {
    try {
        var arrAddr;
        var arrMatch;
        var strEmail;
        if (strAddr.length == 0) {
            return true;
        }
        arrAddr = strAddr.replace(/,/, ";").split(";");
        for (var i = 0; i < arrAddr.length; i++) {
            arrMatch = arrAddr[i].match(/^([^<>]*)<([^<>]+)>$/);
            if (arrMatch == null) {
                strEmail = arrAddr[i];
            } else {
                strEmail = arrMatch[2];
            }
            if (strEmail != null && strEmail != "") {
                if (fnCheckEmailSub(strEmail) == false) {
                    return false;
                }
            }
        }
        return true;
    }
    catch (e) {
        alert(e.description);
        return false;
    }
}
//e-mail 주소 계정 및 도메인을 체크한다.외부에서 직접 호출하지 말고 fnCheckEmail 로부터 호출받아 사용된다.
function fnCheckEmailSub(strEmail) {
    try {
        var arrMatch = strEmail.match(/^(\".*\"|[A-Za-z0-9_-]([A-Za-z0-9_-]|[\+\.])*)@(\[\d{1,3}(\.\d{1,3}){3}]|[A-Za-z0-9][A-Za-z0-9_-]*(\.[A-Za-z0-9][A-Za-z0-9_-]*)+)$/);
        if (arrMatch == null) {
            return false;
        }

        var arrIP = arrMatch[2].match(/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/);
        if (arrIP != null) {
            for (var i = 1; i <= 4; i++) {
                if (arrIP[i] > 255) {
                    return false;
                }
            }
        }
        return true;
    }
    catch (e) {
        alert(e.description);
        return false;
    }
}
//------------------------- String관련 끝 -------------------------

//######################### 윈도우 창 관련 시작 #########################
//윈도우창 모니터화면 가운데 띄우기
function fn_OpenCenterWindow(url, width, height, winName, feature) {
    var nTop = 0;
    var nLeft = 0;
    var nHeight = height;
    var nWidth = width;
    var strFeature = "";
    var oWindow = null;
    try {
        if (feature != null && feature.length > 0)
            strFeature = "," + feature;
        else
            strFeature = strFeature;

        nTop = (window.screen.height / 2) - (nHeight / 2);
        nLeft = (window.screen.width / 2) - (nWidth / 2);
		nLeft += window.screenLeft;//듀얼모니터 일경우 반토막 처럼 떠서.

        oWindow = window.open(url, winName, "width=" + nWidth + ",height=" + nHeight + ",top=" + nTop + ",left=" + nLeft + strFeature);
        oWindow.focus();
    }
    catch (e) {
        alert(e.description);
    }
    finally {
        oWindow = null;
    }
}

//윈도우창 클릭한 브라우져의 가운데에 띄우기
function fn_OpenCenterBrowserWindow(url, width, height, winName, feature,scbars) {
    var nTop = 0;
    var nLeft = 0;
    var nHeight = height;
    var nWidth = width;
    var strFeature = "";
    var oWindow = null;
    try {
        if (feature != null && feature.length > 0)
            strFeature = "," + feature;
        else
            strFeature = strFeature;

        if (window.document.body.offsetHeight > height && window.document.body.offsetWidth > width) {
            nTop = ((window.document.body.offsetHeight - height) / 2) + window.screenTop;
            nLeft = ((window.document.body.offsetWidth - width) / 2) + window.screenLeft;

            if (nTop < (window.screen.height - height) && nLeft < (window.screen.width - width)) {
                oWindow = window.open(url, winName, "width=" + nWidth + ",height=" + nHeight + ",top=" + nTop + ",left=" + nLeft + strFeature+",scrollbars="+scbars);
                oWindow.focus();
            }
            else {
                //새창이 모니터 화면을 벗어나면 가운데 열기
                fn_OpenCenterWindow(url, width, height, winName, feature);
            }
        }
        else {
            //새창이 더 크면 모니터화면 가운데에 열기
            fnOpenCenterWindow(url, width, height, winName, feature);
        }
    }
    catch (e) {
        alert(e.description);
    }
    finally {
        oWindow = null;
    }
}

//마우스 클릭한데서 띄우기
function fnOpenMousePointWindow(url, width, height, winName, feature, MouseEvent) {
    var nTop = 0;
    var nLeft = 0;
    var nHeight = height;
    var nWidth = width;
    var strFeature = "";
    var oWindow = null;
    var nMouseTop = 0;
    var nMouseLeft = 0;
    try {
        nMouseTop = MouseEvent.screenY;
        nMouseLeft = MouseEvent.screenX;

        if (feature != null && feature.length > 0)
            strFeature = "," + feature;
        else
            strFeature = strFeature;

        if ((nMouseTop + height) > window.screen.height)
            nTop = (window.screen.height - height) - 90;
        else
            nTop = nMouseTop;

        if ((nMouseLeft + width) > window.screen.width)
            nLeft = (window.screen.width - width) - 10;
        else
            nLeft = nMouseLeft;

        oWindow = window.open(url, winName, "width=" + nWidth + ",height=" + nHeight + ",top=" + nTop + ",left=" + nLeft + strFeature);
        oWindow.focus();
    }
    catch (e) {
        alert(e.description);
    }
    finally {
        oWindow = null;
    }
}

//모달팝업창을 띠운다.
function fnOpenModalDialog(sUrl, sParam, sFeature) {
    try {
        var strReturn = "";
        strReturn = window.showModalDialog("/_dev/html/ModalDialog.html?" + sUrl, sParam, sFeature);
        return strReturn;
    }
    catch (e) {
        alert(e.description);
    }
}

//모달리스팝업창을 띠운다.
function fnOpenModelessDialog(sUrl, sParam, sFeature) {
    try {
        var strReturn = "";
        strReturn = window.showModelessDialog("/_dev/html/ModelessDialog.html?" + sUrl, sParam, sFeature);
        return strReturn;
    }
    catch (e) {
        alert(e.description);
    }
}
//------------------------- 윈도우 창 관련 끝 -------------------------

//######################### 숫자 관련 시작 #########################
//숫자 포맷.. 세자리수마다.. 콤마 표시
function fnReturnMoneyFormatString(numValue) {
    var strValue = "";
    var retValue = "";
    try {
        strValue = "" + numValue + "";

        for (i = 0; i < strValue.length; i++) {
            if (i > 0 && (i % 3) == 0)
                retValue = strValue.charAt(strValue.length - i - 1) + "," + retValue;
            else
                retValue = strValue.charAt(strValue.length - i - 1) + retValue;
        }
        return retValue;
    }
    catch (e) {
        alert(e.description);
    }
}

//int형으로 변환
function fnGetInt(sNum) {
    try {
        for (var i = 0; i < sNum; i++) {
            if (sNum.substring(0, 1) == 0)
                sNum = sNum.substring(1, sNum.length);
            else
                return parseInt(sNum, 10);
        }
        return parseInt(sNum, 10);
    }
    catch (e) {
        alert(e.description);
    }
}

//숫자를 2자리 문자열로 변환한다.
function fnLeadingZero(iNum) {
    var strReturn;
    try {
        if (iNum < 10)
            strReturn = "0" + iNum;
        else
            strReturn = "" + iNum;

        return strReturn;
    }
    catch (e) {
        alert(e.description);
    }
}
//------------------------- 숫자 관련 시작 -------------------------

//######################### 날짜관련 시작 #########################
//날짜 관련함수 (선택된 월의 마지막날짜 구하고 출력)
function GetLastDay(oYear, oMonth, oDay, currentDay) {
    try {
        oDay.options.length = 1;
        month_day = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

        if (parseInt(oYear.value) % 4 == 0)
            month_day[1] = 29;

        for (i = 0; i < 12; i++) {
            if (oMonth[i].selected) {
                print_day = month_day[i];
                break;
            }
        }

        for (i = 0; i < print_day; i++) {
            j = parseInt(i) + 1;
            j = j.toString().length == 1 ? "0" + j.toString() : j.toString();
            new_option = new Option(j, j);
            oDay.options[i] = new_option;

            if (isNaN(currentDay) == false && oDay.options[i].value == currentDay)
                oDay.options[i].selected = true;
        }
    }
    catch (e) {
        alert(e.description);
    }
}

//두 날짜 사이의 간격을 리턴한다.
function fnDateDiff(sDate, eDate) {
    var arrDate;
    var dtStart, dtEnd, dtDiff;
    var iDays;
    try {
        arrDate = sDate.split("-");
        dtStart = new Date(fnGetInt(arrDate[0]), fnGetInt(arrDate[1]) - 1, fnGetInt(arrDate[2]));
        arrDate = eDate.split("-");
        dtEnd = new Date(fnGetInt(arrDate[0]), fnGetInt(arrDate[1]) - 1, fnGetInt(arrDate[2]));
        dtDiff = dtEnd.getTime() - dtStart.getTime();
        iDays = Math.floor(dtDiff / 1000 / 60 / 60 / 24);
        return iDays;
    }
    catch (e) {
        alert(e.description);
        return "";
    }
}
/**
 * 입력한 값의 중복 체크를 한다.
 */
function fn_IsDayCheck(){

}

//날짜 형식을 검사한다.
function fnDataVaildCheck(sDate) {
    var bDateCheck = false;

    try {
        var arrDate = sDate.split("-");
        // "-"으로 분리된 년월일을 확인한다.
        if (arrDate.length < 3)
            return false;

        if ((fnGetInt(arrDate[0]) < 0 || fnGetInt(arrDate[0]) > 9999) || (isNaN(arrDate[0]))) {
            return false;
        }

        if ((fnGetInt(arrDate[1]) < 1 || fnGetInt(arrDate[1]) > 12) || (isNaN(arrDate[1]))) {
            return false;
        }
        if ((fnGetInt(arrDate[2]) < 1 || fnGetInt(arrDate[2]) > 31) || (isNaN(arrDate[2]))) {
            return false;
        }
        return true;
    }
    catch (e) {
        return false;
    }
}

//해당 날로부터 일수를 더한 일자를 반환한다.
function fnAddDate(sDate, iDate) {
    var strReturn;
    var arrDate;
    var dtOld;
    var iOld;
    var dtNew;
    try {
        arrDate = sDate.split("-");
        dtOld = new Date(fnGetInt(arrDate[0]), fnGetInt(arrDate[1]) - 1, fnGetInt(arrDate[2]));
        iOld = dtOld.getTime();
        dtNew = new Date(iOld + (iDate * 1000 * 60 * 60 * 24));
        strReturn = dtNew.getYear() + "-" + fnLeadingZero(dtNew.getMonth() + 1) + "-" + fnLeadingZero(dtNew.getDate());
        return strReturn;
    }
    catch (e) {
        alert(e.description);
    }
}
//------------------------- 날짜관련 끝 -------------------------

//######################### 기타 시작 #########################
//get파라미터가져오기
function fnRequest(paramName) {
    try {
        var aParams = new Array();
        var sUrlParam = document.location.search.substring(1);

        /*
        for (var nIdx = 0; nIdx < sUrlParam.split("&").length; nIdx++)
            aParams[sUrlParam.split("&")[nIdx].split("=")[0].toString()] = sUrlParam.split("&")[nIdx].split("=")[1].toString();

        if (aParams[paramName])
            return aParams[paramName];
        else
            return "";
        */

        return fn_get_url_param(sUrlParam, paramName);
    }
    catch (e) {
        return "";
    }
}

//PostBack을 일으킨다 Parameter : targetForm - Submit 대상 폼, eventTarget - Target Element, eventArgs - 이벤트 파라메터
function fnRaisePostBack(targetForm, eventTarget, eventArgs) {
    try {
        targetForm.__EVENTTARGET.value = eventTarget.split("$").join(":");
        targetForm.__EVENTARGUMENT.value = eventArgs;
        targetForm.submit();
    }
    catch (e) {
        alert(e.description);
    }
}

//Len입력시 자동 다음컨트롤 이동
function autoTab(input, Len) {
    if (input.value.length >= Len) {
        input.value = input.value.slice(0, Len);
        input.form[(getIndex(input) + 1) % input.form.length].focus();
    }

    function getIndex(input) {
        var index = -1, i = 0, found = false;
        while (i < input.form.length && index == -1)
            if (input.form[i] == input) index = i;
            else i++;
        return index;
    }
    return true;
}

//쿠기 저장하기
function fnSetCookie(name, value, expires, path, domain, secure) {
    document.cookie = name + "=" + escape(value) +
    ((expires) ? "; expires=" + expires.toGMTString() : "") +
    ((path) ? "; path=" + path : "") +
    ((domain) ? "; domain=" + domain : "") +
    ((secure) ? "; secure" : "");
}

//쿠키 가져오기
function fnGetCookie(uName) {
    var flag = document.cookie.indexOf(uName + '=');
    if (flag != -1) {
        flag += uName.length + 1
        end = document.cookie.indexOf(';', flag)

        if (end == -1) end = document.cookie.length
        return unescape(document.cookie.substring(flag, end))
    }
    else {
        return ""
    }
}
//------------------------- 기타 끝 -------------------------

function fnRid_Tag(inString) {
    var otString = "";
    otString = inString.replace(/<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/g, "");
    return otString;
}


function Right(str, num) {

    var iLen;
    if (num <= 0) { return ""; }
    else if (num > String(str).length) { return str; }
    else {
        var iLen = String(str).length;
        return String(str).substring(iLen, iLen - num);
    }
}

function Left(str, num) {
    if (num <= 0) { return ""; }
    else if (num > String(str).length) { return str; }
    else {
        return String(str).substring(0, num);
    }
}


function fn_Class_toggle(inIdx, inClass, inOver) {

    var classname = document.getElementById(inIdx).className;

    if (classname.indexOf(inOver) > -1) {
        document.getElementById(inIdx).className = inClass;
    } else {
        document.getElementById(inIdx).className = inClass + " " + inOver;
    }
}


function fn_phtoyn_select(inI, inCat_name, inCat_id) {

    $("#id_cateogry_fix").html(inCat_name);
    fn_Class_toggle('id_cate_option', 'option', 'over');
}


function  fnRestoreSpString(s) {
    if (s == "") { return ""; }
    else { return s.replace("&amp;", "&").replace("&quot;", "\"").replace(/\&lt;/g, "<").replace(/\&gt;/g, ">").replace("&#039;", "'").replace("&#091;", "[").replace("&#093;", "]").replace("&#39;", "'").replace("&#91;", "[").replace("&#93;", "]").replace("&#037;", "%").replace("&#045;", "-"); }
}


function fn_getUrlParam(inUrl, inParam) {

    gubun_id = inUrl.split("&");
    otValue = "";

    try {
        for (i = 1; i <= gubun_id.length; i++) {
            if (gubun_id[i] != undefined && gubun_id[i] != "") {

                if (gubun_id[i].indexOf(inParam + "=") != -1) {
                    otValue = gubun_id[i].replace(inParam + "=", "");
                }

            }
        }
    } catch (e) {
		otValue = "";
    }
    return otValue;
}

/**
* 이미지 다중업로드 추가
*
*
*
* */
var rowIndex = 1;

function addFile(form){

/*if(rowIndex > 10) return false;*/




rowIndex++;

var getTable = document.getElementById("insertTable");

var oCurrentRow = getTable.insertRow(getTable.rows.length);

var oCurrentCell = oCurrentRow.insertCell(0);

oCurrentCell.innerHTML = "<tr><td colspan=2><INPUT TYPE='FILE' NAME='main_img_url' class=text></td></tr>";

}



/* 이미지 업로드 삭제
*
* 추가 된 이미지 삭제.
*
*
* */

function deleteFile(form){

if(rowIndex<2){
	alert("마지막 1개까지는 삭제 하실수 없습니다.");
    return false;

}else{

	rowIndex--;

	var getTable = document.getElementById("insertTable");

	getTable.deleteRow(rowIndex);

}

}
/**
 * 영문 체크
 */
function fn_Engcheck(input){

	var eng_pattern = /^[a-zA-Z]+$/;

	return eng_pattern.test(input);
}
/**
 * 한글 체크
 */
function fn_Hangulcheck(input){

	var hangul_pattern = /^[가-힣^@]+$/;

	return hangul_pattern.test(input);
}
/**
 * 숫자 영문 체크
 */
function fn_NumEngcheck(input){

	var pattern = /^[a-zA-Z0-9]+$/;

	return pattern.test(input);
}

/**
 * 아이디 조합 영문 + 숫자
 */
function fn_EndNumcheck(input){

	var pattern = /^[a-z0-9]+$/g;

	return pattern.test(input);
}

/**
 * 패스워드 체크
 */
function fn_chkPasswd(values){

	var pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[^a-z0-9])(?!.*\s).{9,30}$/;		// srhan. 20250101. 비밀번호를 대소문자 구분하지 않고 소문자만으로 처리


	if (pattern.test(values)) {
        return true;
    } else {
        return false;
    }


}

/**
 * 아이피 체크
 *
 *
 **/
function fn_ipCheck(values){

 	var pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;



 	return pattern.test(values);
}


function nvl(str, defaultStr) {
	if (typeof str == "undefined" || str == null || str == "") {
		str = defaultStr;
	}
	return str;
}

/**
 * 첨부파일 확장자 체크
 */
function fn_fileExtnCheck(){

	var isCheck = false;

	var fileVal = $("#fileNm").val();

	if(fileVal != ""){

		var ext = fileVal.split(".").pop().toLowerCase();

		if($.inArray(ext,['PDF','JPG','PNG']) == -1){
			isCheck = true;
		}
	}

	return isCheck;
}

/**
 * 파일 용량 체크
 */

function fn_fileSizeCheck(obj,size){

	var check = false;

	if(window.ActiveXObject){
		var fso = new Array();

		var filePath = obj[0].value;

		var strfile = fso.getFile(filePath);

		sizeByte = strfile.size;
	}else{
		sizeByte = obj[0].files[0].size;
	}

	var extn = new Array('Bytes','KB','MB','GB');

	var i = 0;

	var checkSize = size;

	while(checkSize > 900){
		checkSize /= 1024;
	}

	checkSize = (Math.round)


}

function isEtcChar(value) {
	var flag = false;
    var chkCnt = 0;
	for (var i=0; i < value.length; i++) {
	    ch_char = value.charAt(i);
	    ch = ch_char.charCodeAt();
        if( (ch >= 33 && ch <= 47) || (ch >= 58 && ch <= 64) || (ch >= 91 && ch <= 96) || (ch >= 123 && ch <= 126) ) {
        	chkCnt = chkCnt + 1;
        }
	}

	if(chkCnt > 0){
		flag = true;
	} else {
		flag = false;
	}
	return flag;
}

/* 캡차 공통화처리
function soundOn(AudioNber){

	var browserInfo = navigator.userAgent.toLowerCase();

	 var i=0;
	 var n=0;
	 var r=0;

	 var src = "";

	 setInterval(function(){
	 if(i++ < 6) {
		 	n = i-1;
		 	r = n + 1;
		 	src = AudioNber.substring(n,r);
		 	src = "/audio/" + src + ".wav";

		 	if((browserInfo.indexOf("msie") >= 0 || browserInfo.indexOf("trident") >= 0)){
		 		winPlayer(src);
			} else if((browserInfo.indexOf("chrome") >= 0 || browserInfo.indexOf("firefox") >= 0 || browserInfo.indexOf("safari") >= 0 )){
				new Audio(src).play();
			} else if(!document.createElement('audio').canPlayType){
				try{
					new Audio(src).play();
				} catch(e) {
					winPlayer(src);
				}
			} else {
				window.open(src, '', 'width=1, height=1');
			}
		}
	 },1000);
}

function Checksound(){
	if(document.form1.answer.value == 'Y'){
		soundOn(document.form1.playNb.value);
	}
}


function winPlayer(objUrl){
	$('#audiocaptcha').html('<bgsound src="' + objUrl + '">');
}


function fn_comCapchaAuth(){

	if($("#answer").val() == ""){
		alert("숫자를 입력하세요.");
		$("#answer").focus();
		return;
	}

	$.ajax({
		url : '/rccom/selectComCapchaAuth.do',
		type : 'POST',
		data : "answerNb="+$("#answer").val(),
		dataType : 'json',
		contentType : "application/x-www-form-urlencoded;charset=UTF-8",
		success : function(data) {

			if(data.data > 0){
				$("#captcha_info").html("<font color='blue'>인증 되었습니다.</font>");
				$("#capchaAuth").val("Y");

				if ( $("#btnCapchaAuth") != undefined )
				{
					$("#btnCapchaAuth").attr("disabled", true);
				}
			}else{
				$("#captcha_info").html("<font color='red'>실패 되었습니다.</font>");
				$("#capchaAuth").val("N");
			}

		},
		error : function() {
			$("#result").html('서버와의 통신에 에러가 발생하였습니다.');
		}
	});
}

function fn_regenCapcha(){
	let d = new Date();
	$("#captcha_img").attr("src", "/rccom/captchaInfo.do?"+d.getTime());
}
*/


/**
 * 공통 코드 그룹 코드 리스트 조회
 *
 * cmmGpCode : 그룹코드
 * param1 : 셀렉티드 할 코드 업으면 안되고 있으면 셀렉티드 됨
 * divId : 화면에 표출할 ID
 * strMsg : 데이터가 널일경우 표출
 */
function cfn_getCodeList(comGroupCd,param1,divId,strMsg){

	$.ajax({
		url : '/oprut/selectCodeList.do',
		type : 'POST',
		data : "comGroupCd="+comGroupCd,
		dataType : 'json',
		contentType : "application/x-www-form-urlencoded;charset=UTF-8",
		success : function(data) {

			var html = '';

			if(data.data == null){
				html += '<option value="">'+strMsg+'</option>';
			}else{
					html += '<option value="">::::선택::::</option>';
				$.each(data.data,function(index,entry){
					html += '<option value="'+data.data[index].comCd+'"';
					if(param1 == data.data[index].comCd){
						html += ' selected ';
					}
					html += '>'+data.data[index].comCdNm+'</option>';
				});
			}
			$("#"+divId).html(html);
		},
		error : function() {
			$("#result").html('서버와의 통신에 에러가 발생하였습니다.');
		}
	});




}

/**
 * 회원인적사항정보
 *
 */
function cfn_getMemberInfo(){

	$.ajax({
		url : '/oprut/selectMemberInfo.do',
		type : 'POST',
		//data : "comGroupCd="+comGroupCd,
		dataType : 'json',
		contentType : "application/x-www-form-urlencoded;charset=UTF-8",
		success : function(data) {

			if(data.data != null){

				var hpPhone = data.data.mblTelnoEncpt;
				//var areaPhone = data.data.homeTelnoEncpt;

				var hpPhoneStr = hpPhone.replace(/-/g, '');
				//var areaPhoneArray = areaPhone.split("-");
				var emailArray = data.data.emlAddr.split("@");

				var tmpHpPhone1 = hpPhoneStr.slice(0, 3);//핸드번앞자리
				var tmpHpPhone2 = hpPhoneStr.slice(3, 7);//핸드폰중간자리
				var tmpHpPhone3 = hpPhoneStr.slice(7, 11);//핸드폰마지막자리

				//var areaPhone1 = areaPhoneArray[0];//지역국번
				//var areaPhone2 = areaPhoneArray[1];//중간번호
				//var areaPhone3 = areaPhoneArray[2];//마지막번호

				var tmpEmail1 = emailArray[0];
				var tmpEmail2 = emailArray[1];

				$("#kornFlnm").val(data.data.mbrFlnm);
				$("#izip").val(data.data.izip);
				$("#aplctAddr").val(data.data.bscAddr);
				$("#aplctDaddr").val(data.data.daddrEncpt);
				$("#emgcyCadrIndivTelno1").val(tmpHpPhone1).attr("selected",true);
				$("#emgcyCadrIndivTelno2").val(tmpHpPhone2);
				$("#emgcyCadrIndivTelno3").val(tmpHpPhone3);

				//$("#emgcyCadrRgnTelno1").val(areaPhone1).attr("selected",true);
				//$("#emgcyCadrRgnTelno2").val(areaPhone2);
				//$("#emgcyCadrRgnTelno3").val(areaPhone3);

				$("#select_email_domain").val(tmpEmail2).attr("selected",true);
				$("#emailDomain").val(tmpEmail2);
				$("#emailId").val(tmpEmail1);

				$("#emailDomain").attr("readonly",true);
				$("#aplctPost").attr("readonly",true);

			}else{
				alert("데이터 조회 중 오류가 발생했습니다.");
			}
		},
		error : function() {
			alert('서버와의 통신에 에러가 발생하였습니다.');
			return;
		}
	});
}

/* ********************************************************
 * 한국사 실시간 조회
 ******************************************************** */
function cfn_getKoreaInfo(){

	$.ajax({
		url : '/oprut/selectMemberInfo.do',
		type : 'POST',
		//data : "comGroupCd="+comGroupCd,
		dataType : 'json',
		contentType : "application/x-www-form-urlencoded;charset=UTF-8",
		success : function(data) {

			if(data.data != null){

				var hpPhone = data.data.mblTelnoEncpt;
				var areaPhone = data.data.homeTelnoEncpt;
				var email = data.data.emlAddr;

				var hpPhoneArray = hpPhone.split("-");
				var areaPhoneArray = areaPhone.split("-");
				var emailArray = email.split("@");


				var tmpHpPhone1 = hpPhoneArray[0];//핸드번앞자리
				var tmpHpPhone2 = hpPhoneArray[1];//핸드폰중간자리
				var tmpHpPhone3 = hpPhoneArray[2];//핸드폰마지막자리

				var areaPhone1 = areaPhoneArray[0];//지역국번
				var areaPhone2 = areaPhoneArray[1];//중간번호
				var areaPhone3 = areaPhoneArray[2];//마지막번호

				var tmpEmail1 = emailArray[0];
				var tmpEmail2 = emailArray[1];



				$("#kornFlnm").val(data.data.mbrFlnm);
				$("#aplctPost").val(data.data.zip);
				$("#aplctAddr").val(data.data.bscAddr);
				$("#aplctDaddr").val(data.data.daddr);
				$("#emgcyCadrIndivTelno1").val(tmpHpPhone1).attr("selected",true);
				$("#emgcyCadrIndivTelno2").val(tmpHpPhone2);
				$("#emgcyCadrIndivTelno3").val(tmpHpPhone3);

				$("#emgcyCadrRgnTelno1").val(areaPhone1).attr("selected",true);
				$("#emgcyCadrRgnTelno2").val(areaPhone2);
				$("#emgcyCadrRgnTelno3").val(areaPhone3);

				$("#select_email_domain").val(tmpEmail2).attr("selected",true);
				$("#emailDomain").val(tmpEmail2);
				$("#emailId").val(tmpEmail1);

				$("#emailDomain").attr("readonly",true);
				$("#aplctPost").attr("readonly",true);

			}else{

				var hpPhone = "010-1111-1111";
				var areaPhone = "02-111-1111";

				var email = "test@naver.com";

				var hpPhoneArray = hpPhone.split("-");
				var areaPhoneArray = areaPhone.split("-");
				var emailArray = email.split("@");


				var tmpHpPhone1 = hpPhoneArray[0];//핸드번앞자리
				var tmpHpPhone2 = hpPhoneArray[1];//핸드폰중간자리
				var tmpHpPhone3 = hpPhoneArray[2];//핸드폰마지막자리

				var areaPhone1 = areaPhoneArray[0];//지역국번
				var areaPhone2 = areaPhoneArray[1];//중간번호
				var areaPhone3 = areaPhoneArray[2];//마지막번호

				var tmpEmail1 = emailArray[0];
				var tmpEmail2 = emailArray[1];



				$("#kornFlnm").val("홍길동");
				$("#aplctPost").val("08759");
				$("#aplctAddr").val("서울특별시 용산구 숙대길 5-10");
				$("#aplctDaddr").val("KCC IT 빌딩 909호");
				$("#emgcyCadrIndivTelno1").val(tmpHpPhone1).attr("selected",true);
				$("#emgcyCadrIndivTelno2").val(tmpHpPhone2);
				$("#emgcyCadrIndivTelno3").val(tmpHpPhone3);

				$("#emgcyCadrRgnTelno1").val(areaPhone1).attr("selected",true);
				$("#emgcyCadrRgnTelno2").val(areaPhone2);
				$("#emgcyCadrRgnTelno3").val(areaPhone3);

				$("#select_email_domain").val(tmpEmail2).attr("selected",true);
				$("#emailDomain").val(tmpEmail2);
				$("#emailId").val(tmpEmail1);

				$("#emailDomain").attr("readonly",true);
				$("#aplctPost").attr("readonly",true);
			}
		},
		error : function() {
			alert('서버와의 통신에 에러가 발생하였습니다.');
			return;
		}
	});
}

var G_UploadID;

function fn_addFile() {
    var tempPath = location.href;
    tempPath = tempPath.substring(0, tempPath.lastIndexOf('/'));
    tempPath = tempPath.substring(0, tempPath.lastIndexOf('/'));

    // 실제 서버상의 파일을 작성합니다.

    /* AddUploadedFile API를 활용할 경우
    RAONKUPLOAD.AddUploadedFile('1', '전경사진.jpg', tempPath + '/images/Panorama/ViewPhotos.jpg', '87325', '', G_UploadID);
    RAONKUPLOAD.AddUploadedFile('2', '풍경이미지.bmp', tempPath + '/images/Scenery/image/CreativeImages.bmp', '2359350', '', G_UploadID);
    */

    // AddUploadedFileAsObject API를 활용할 경우
    var fileList = [];
    var file1 = { uniqueKey: "1", originName: "전경사진.jpg", webPath: tempPath + '/images/Panorama/ViewPhotos.jpg', size: "87325", customValue: '' };
    var file2 = { uniqueKey: "2", originName: "풍경이미지.bmp", webPath: tempPath + '/images/Scenery/image/CreativeImages.bmp', size: "2359350", customValue: '' };
    fileList.push(file1);
    fileList.push(file2);

    var uploadedFileObj = {
        fileList: fileList,
        uploadName: G_UploadID
    };




    RAONKUPLOAD.AddUploadedFileAsObject(uploadedFileObj);
}

// 생성완료 이벤트
function RAONKUPLOAD_CreationComplete(uploadID) {
    G_UploadID = uploadID;

    var logBox = document.getElementById("logBox");
    logBox.innerHTML += '업로드 생성 완료 이벤트: ' + uploadID + '<br/>';

    fn_addFile();
}

// 파일 열기전 이벤트
function RAONKUPLOAD_BeforeOpenFile(uploadID, paramObj) {
    G_UploadID = uploadID;
    var retVal = false;

    var logBox = document.getElementById("logBox");
    logBox.innerHTML += '열기 전 이벤트: ' + uploadID + ' / ' + retVal + '<br/>';

    // 아래에서 false 값을 리턴하면 열기가 진행되지 않습니다.
    return retVal;
}

// 파일 다운로드전 이벤트
function RAONKUPLOAD_BeforeDownloadFile(uploadID, paramObj) {
    G_UploadID = uploadID;
    var retVal = true;

    var logBox = document.getElementById("logBox");
    logBox.innerHTML += '다운로드 전 이벤트: ' + uploadID + ' / ' + retVal + '<br/>';

    // 아래에서 false 값을 리턴하면 다운로드가 진행되지 않습니다.
    return retVal;
}

// 오류 이벤트
function RAONKUPLOAD_OnError(uploadID, paramObj) {
    var logBox = document.getElementById("logBox");
    logBox.innerHTML += 'Error : ' + paramObj.strCode + ', ' + paramObj.strMessage + '<br/>';

    if (paramObj.arrUploadedFileList != null && paramObj.arrUploadedFileList != '') {
        logBox.innerHTML += '업로드 된 파일 리스트 - <br/>';
        var uploadedFileLen = paramObj.arrUploadedFileList.length;
        for (var i = 0; i < uploadedFileLen; i++) {
            logBox.innerHTML += paramObj.arrUploadedFileList[i].uploadName + ', ' + paramObj.arrUploadedFileList[i].uploadPath + '</br>';

            // originName: paramObj.arrUploadedFileList[i].originName
            // fileSize: paramObj.arrUploadedFileList[i].fileSize
            // uploadName: paramObj.arrUploadedFileList[i].uploadName
            // uploadPath: paramObj.arrUploadedFileList[i].uploadPath
            // logicalPath: paramObj.arrUploadedFileList[i].logicalPath
            // order: paramObj.arrUploadedFileList[i].order
            // status: paramObj.arrUploadedFileList[i].status
            // customValue: paramObj.arrUploadedFileList[i].customValue
            // responseCustomValue: paramObj.arrUploadedFileList[i].responseCustomValue
        }
    }
}







/**
 * 패스워드 암호화 복구 불가 단방향
 */
function SHA256(s){

    var chrsz   = 8;
    var hexcase = 0;

    function safe_add (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
    function R (X, n) { return ( X >>> n ); }
    function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
    function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
    function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
    function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
    function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
    function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

    function core_sha256 (m, l) {

        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1,
            0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
            0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786,
            0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
            0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147,
            0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
            0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B,
            0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
            0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A,
            0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
            0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);

        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);

        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;

        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for ( var i = 0; i<m.length; i+=16 ) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];

            for ( var j = 0; j<64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));

                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }

            HASH[0] = safe_add(a, HASH[0]);
            HASH[1] = safe_add(b, HASH[1]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            HASH[5] = safe_add(f, HASH[5]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }

    function str2binb (str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
        }
        return bin;
    }

    function Utf8Encode(string) {
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }

    function binb2hex (binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
            hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
        }
        return str;
    }

    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));

}

function fn_getFileExtension(fileName){
	var fileExtension = fileName.substring(fileName.lastIndexOf(".")+1, fileName.length);
	return fileExtension;
}
/**
* fn_getFileRootPath : 파일경로 추출
* @return : N/A
* @example :
*/
function fn_getFileRootPath(fileRoot){
	var rule = RAONKUPLOAD.GetConfig("FolderNameRule");
	var ruleSize = rule.split("/");

	var rootPath = fileRoot;
	var last = rootPath.lastIndexOf("/");
	var root = rootPath.substring(0, last); // 파일명제거
	var cpRoot = root;
	for(var i=0; i < ruleSize.length; i++){
		cpRoot = cpRoot.substring(0,cpRoot.lastIndexOf("/"));
	}
	return root.substring(cpRoot.length, root.length);
}

function fn_setTransUploadFile(frm){
	for(var i = 0; i < RAONKUPLOAD.GetNewUploadList().length; i++){
		var file = RAONKUPLOAD.GetNewUploadList()[i];
		/* 여러게 첨부파일시 밑에꺼하고 바꾸시요.
		$("#form1").append("<input type='hidden' name='atchFileList["+i+"].myAtchFileId' value='"+fileId+"' />");
		$("#form1").append("<input type='hidden' name='atchFileList["+i+"].myAtchFileOrgn' value='"+originalName+"' />");
		$("#form1").append("<input type='hidden' name='atchFileList["+i+"].myAtchFilePath' value='"+uploadPath+"' />");
		*/
		frm.append("<input type='hidden' name='atchFileId' id='atchFileId'  value='"+file.fileId+"' />");
		frm.append("<input type='hidden' name='atchFileNm' id='atchFileNm'  value='"+file.uploadName+"' />");
		frm.append("<input type='hidden' name='strgFileNm' id='strgFileNm'  value='"+file.originalName+"' />");
		frm.append("<input type='hidden' name='atchFileSz' id='atchFileSz' 	value='"+file.size+"' />");
		frm.append("<input type='hidden' name='filePathNm' id='filePathNm' 	value='"+fn_getFileRootPath(file.uploadPath)+"' />");
		frm.append("<input type='hidden' name='fileExtnNm' id='fileExtnNm'  value='"+fn_getFileExtension(file.originalName)+"' />");
	}
}

function fn_getProFile(atchFileId){
	if(atchFileId != null){
		var url = "";
		var loacation = window.location.pathname;
		if(loacation.indexOf("oprut") > 0) {
			$.ajax({
				type : "POST",
				url : "/oprut/GetAtchFileLst.do",
				data : {
					atchFileId: atchFileId
				},
				async: false,
				success : function(jdata){
					return jdata;
				},
				error : function(){
				}
			});

		} else if(url.indexOf("crrut") > 0){
			url = "/crrut/AtchFileLst.do";
			$.ajax({
				type : "POST",
				url : "/crrut/AtchFileLst.do",
				data : {
					atchFileId: atchFileId
				},
				async: false,
				success : function(jdata){
					return jdata;
				},
				error : function(){
				}
			});
		}
	}
}


function fn_getFile(atchFileId, upLoadID){
	if(atchFileId != null){
		var url = "";
		var loacation = window.location.pathname;
		if(loacation.indexOf("oprut") > 0 || loacation.indexOf("rccom") > 0 ) {
			$.ajax({
				type : "POST",
				url : "/oprut/GetAtchFileLst.do",
				data : {
					atchFileId: atchFileId
				},
				async: false,
				success : function(jdata){
					if(jdata != null){
						fn_getUploadFile(jdata, upLoadID)
					}
				},
				error : function(){

				}
			});

		} else if(loacation.indexOf("crrut") > 0 ){
			$.ajax({
				type : "POST",
				url : "/crrut/AtchFileLst.do",
				data : {
					atchFileId: atchFileId
				},
				async: false,
				success : function(jdata){
					if(jdata != null){
						fn_getUploadFile(jdata, upLoadID)
					}
				},
				error : function(){

				}
			});
		} else if (loacation.indexOf("spcsv") > 0 ) {
			$.ajax({
				type : "POST",
				url : "/spcsv/GetAtchFileLst.do",
				data : {
					atchFileId: atchFileId
				},
				async: false,
				success : function(jdata){
					if(jdata != null){
						fn_getUploadFile(jdata, upLoadID)
					}
				},
				error : function(){

				}
			});

		} else if (loacation.indexOf("task") > 0 ) {
			$.ajax({
				type : "POST",
				url : "/task/GetAtchFileLst.do",
				data : {
					atchFileId: atchFileId
				},
				async: false,
				success : function(jdata){
					if(jdata != null){
						fn_getUploadFile(jdata, upLoadID)
					}
				},
				error : function(){

				}
			});

		}
	}
}

function fn_getKcFile(atchFileId, upLoadID){
	if(atchFileId != null){
		var url = "";
		var loacation = window.location.pathname;
		if(loacation.indexOf("oprut") > 0 || loacation.indexOf("rccom") > 0 ) {
			$.ajax({
				type : "POST",
				url : "/oprut/GetKcAtchFileLst.do",
				data : {
					rcatcfId: atchFileId
				},
				async: false,
				success : function(jdata){
					if(jdata != null){
						fn_getKcUploadFile(jdata, upLoadID)
					}
				},
				error : function(){

				}
			});

		}
	}
}

async function fn_getUploadFile(files, upLoadID){
 	var fileList = [];
	var loacation = window.location.pathname;
	$.each(files, function(i,v){
		fileList.push({
			uniqueKey: i,
			originName: v.strgFileNm,
			webPath: v.filePathNm,
			size: v.atchFileSz
		});
	})

	var uploadedFileObj = {
		fileList: fileList,
		uploadName: upLoadID
	};

	RAONKUPLOAD.AddUploadedFileAsObject(uploadedFileObj);
}

async function fn_getKcUploadFile(files, upLoadID){
 	var fileList = [];
	var loacation = window.location.pathname;
	$.each(files, function(i,v){
		fileList.push({
			uniqueKey: i,
			originName: v.strgFileNm,
			webPath: v.fileStrgPathCn,
			size: v.atchFileSz
		});
	})

	var uploadedFileObj = {
		fileList: fileList,
		uploadName: upLoadID
	};

	RAONKUPLOAD.AddUploadedFileAsObject(uploadedFileObj);
}

// 파일 다운로드
function fn_egov_downFile(fileId, upLoadID){
	RAONKUPLOAD.ResetUpload(upLoadID);

	$.ajax({
		type : "POST",
		url : "/oprut/GetAtchFileLst.do",
		data : {
			atchFileId: fileId
			//, atchFileSn: atchFileSn
		},
		async: false,
		success : function(jdata){
			if(jdata != null){
			 	var fileList = [];
				$.each(jdata, function(i,v){
					// srhan. 20250417. 임시조치. 잘못 마이그된 데이터 다운로드 가능하게 처리.
					// v.filePathNm이 /05/67/1/20250401151958_00133281711098064218.pdf같이 /bit/로 시작하지 않으면 잘못 마이그된 것. 앞에 /bit를 붙여주자.
					fileList.push({
						uniqueKey: i,
						originName: v.strgFileNm,
						webPath: v.filePathNm,
						size: v.atchFileSz
					});
				})

				var uploadedFileObj = {
					fileList: fileList,
					uploadName: upLoadID
				};

				RAONKUPLOAD.AddUploadedFileAsObject(uploadedFileObj, function(){
					RAONKUPLOAD.DownloadAllFile(upLoadID);
				});
			}
		},
		error : function(){

		}
	});
}

function fn_isBlank(str){
	if(typeof str === "undefined" || str == null || str == "" || str.trim().length == 0){
		return true;
	}
	return false;
}

function fn_loading(){
	alert("준비중입니다.");
	return;
}

/**
* fn_onlyNumEng : 숫자 + 영문 입력
* @param1 event 객체
* @param2 alert 띄움 여부 (boolean)
* @return : number
* @example : ㅁㅁㅁa1a2a3a4 -> a1a2a3a4
*/
function fn_onlyNumEng(e, isAlert){
	var str = $(e).val();
	var regex = /[^a-z|A-Z|0-9]/g;
	if (isAlert && regex.test(str)) alert("숫자, 영문만 입력 가능합니다.");
	$(e).val(str.replace(regex, ""));
}

/**
* fn_onlyNumEng : 숫자 + 영문 + 하이픈 입력
* @param1 event 객체
* @param2 alert 띄움 여부 (boolean)
* @return : number
* @example : ㅁㅁㅁa1a2a3a4 -> a1a2a3a4
*/
function fn_onlyNumEngHyp(e, isAlert){
	var str = $(e).val();
	var regex = /[^a-z|A-Z|0-9|-]/g;
	if (isAlert && regex.test(str)) alert("숫자, 영문, 하이픈(-)만 입력 가능합니다.");
	$(e).val(str.replace(regex, ""));
}

/**
* fn_onlyNum : 숫자만 입력
* @param1 event 객체
* @param2 alert 띄움 여부 (boolean)
* @return : number
* @example : a1a2a3a4 -> 1234
*/
function fn_onlyNum(e, isAlert){
	var str = $(e).val();
	var regex = /[^0-9]/g;
	if (isAlert && regex.test(str)) alert("숫자만 입력 가능합니다.");
	$(e).val(str.replace(regex, ""));
}
/**
* fn_onlyNum : 숫자 + '.' 만 입력
* @param1 event 객체
* @param2 alert 띄움 여부 (boolean)
* @return : number
* @example : a1a2a3a4 -> 1234
*/
function fn_onlyNumDot(e, isAlert){
	var str = $(e).val();
	var regex = /[^0-9.]/g;
	var regex2 = /(\..*)\./g;
	if (isAlert && regex.test(str)) alert("숫자만 입력 가능합니다.");
	$(e).val(str.replace(regex, "").replace(regex2, '$1'));
}
/**
* fn_onlyKor : 한글만 입력
* @param1 event 객체
* @param2 alert 띄움 여부 (boolean)
* @return : string
* @example : ㄱㄱa1a2a3a4 -> ㄱㄱ
*/
function fn_onlyKor(e, isAlert){
	var str = $(e).val();
	var regex = /[^ㄱ-힣]/g;
	if (isAlert && regex.test(str)) {
		alert("한글만 입력 가능합니다.", function() {
			$(e).focus();
		});
	}
	$(e).val(str.replace(regex, ""));
}/**
* fn_onlyEng : 영어만 입력
* @param1 event 객체
* @param2 alert 띄움 여부 (boolean)
* @return : string
* @example : ㄱㄱa1a2a3a4BB -> aaaaBB
*/
function fn_onlyEng(e, isAlert){
	var str = $(e).val();
	var regex = /[^a-z|A-Z|\s]/g;
	if (isAlert && regex.test(str)) alert("영어만 입력 가능합니다.", function() {
			$(e).focus();
		});
	$(e).val(str.replace(regex, ""));
}

/**
* fn_getMonth : 월 m -> mm 변경
* @return : 02
* @example : 3 -> 03 , 11 -> 11
*/
function fn_getMonth(e){
	var str = $(e).val();
	var regex = /[^0-9]/g;
	str = str.replace(regex, "");
	if(!fn_isBlank(str)){
		str = parseInt(str);
	} else {
		$(e).val("01");
		return;
	}
	var strReturn;
	try {
		if (str < 10)
			strReturn = "0" + str;
		else if (str > 12)
			strReturn = "01";
		else
			strReturn = "" + str;
		$(e).val(strReturn);
	} catch (e) {
		return;
	}
}

/**
 * 멀티로우 형식일때 사용
 * rowIndex : 캘린더 멀티로우 인덱스
 * paramDiv : 표출할 아이디값
 * format : 날짜 포맷(optional) : 'Y-m-d'
 */
function fn_getsDate(rowIndex,paramDiv,format){
	$("#"+paramDiv+rowIndex).datetimepicker({
		 	timepicker:false,		// 날짜만 표시되게 함
		 	format: format||'Y-m-d',
			changeYear: true,
			changeMonth: true,
			theme:'light',
			closeOnDateSelect:true,
			lang:'ko',
			showOn: "both",
			buttonText: "<span class='blind'>날짜 선택</span>",
			yearRange: 'c-50:c+50',
			//maxDate : 0,
			onSelectDate : function(value,event){
			},
			kr:{
				months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
				monthNames : ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
				dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"],
				dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
			}
		},
		//$.datepicker.regional['ko']

	);
	$.datetimepicker.setLocale('kr');
}


function fn_getsDateMonth(rowIndex,paramDiv,format){
	$("#"+paramDiv+rowIndex).datetimepicker({
		 	timepicker:false,		// 날짜만 표시되게 함
		 	datepicker : true,
		 	format: format||'Y-m-d',
			changeYear: true,
			changeMonth: true,
			theme:'light',
			validateOnBlur : false,
			closeOnDateSelect : false,
			closeOnMonthSelect : true,
			lang:'ko',
			showOn: "both",
			buttonText: "<span class='blind'>날짜 선택</span>",
			yearRange: 'c-50:c+50',
			//maxDate : 0,
			onShow : function(ct){
			},
			onSelectDate : function(value,event){
			},
			kr:{
				months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
				monthNames : ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
				dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"],
				dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
			}
		},
		//$.datepicker.regional['ko']

	);
	$.datetimepicker.setLocale('kr');
}

/**
 * 멀티로우 형식일때 사용
 * rowIndex : 캘린더 멀티로우 인덱스
 * paramDiv : 표출할 아이디값
 */
function fn_geteDate(rowIndex,paramDiv,format){

	$("#"+paramDiv+rowIndex).datetimepicker({
		 	timepicker:false,		// 날짜만 표시되게 함
		 	format:format||'Y-m-d',
			changeYear: true,
			changeMonth: true,
			theme:'light',
			closeOnDateSelect:true,
			lang:'ko',
			showOn: "both",
			buttonText: "<span class='blind'>날짜 선택</span>",
			yearRange: 'c-50:c+50',
			//maxDate : 0,
			onSelect : function(value,event){
				var sDate = $("#workBgngYmd"+rowIndex).val().replace("-","");
				var eDate = $("#workEndYmd"+rowIndex).val().replace("-","");
				if(sDate > eDate){
					alert("시작일보다 이전일을 선택할수 없습니다.");
					return;
				}

			},
			kr:{
				months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
				dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"],
				dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
			}
		},

	);
	$.datetimepicker.setLocale('kr');
}


/**
 * 싱글일떄
 * rowIndex : 캘린더 멀티로우 인덱스
 * paramDiv : 표출할 아이디값
 */
function fn_getSingleDate(rowIndex,paramDiv){

	$("#"+paramDiv+rowIndex).datetimepicker({
		 	timepicker:false,		// 날짜만 표시되게 함
		 	format:'Y-m-d',
			changeYear: true,
			changeMonth: true,
			theme:'light',
			closeOnDateSelect:true,
			lang:'ko',
			showOn: "both",
			buttonText: "<span class='blind'>날짜 선택</span>",
			yearRange: 'c-50:c+50',
			onSelect : function(value,event){

			},
			kr:{
				months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
				monthNames : ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
				dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"],
				dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
			}
		},
		//$.datepicker.regional['ko']

	);
	$.datetimepicker.setLocale('kr');
}

function fn_setPaging(page, fn){
	var pagingHtml = "";
	if (page.totalPageCount > page.pageSize) {
		if (page.firstPageNoOnPageList > page.pageSize) {
			pagingHtml = '<li class=\"page-item first\"><a href=\"#\" class=\"page-link first\" title=\"첫페이지\" onclick=\"'+fn+'('+page.firstPageNo+'); return false;\">처음</a></li>';
			pagingHtml = '<li class=\"page-item prev\"><a href=\"#\" class=\"page-link prev\" title=\"이전페이지\" onclick=\"'+fn+'('+(page.firstPageNoOnPageList - 1)+'); return false;\">이전</a></li>';
		} else {
			pagingHtml = '<li class=\"page-item first\"><a href=\"#\" class=\"page-link first\" title=\"첫페이지\" onclick=\"'+fn+'('+page.firstPageNo+');\">처음</a></li>';
			pagingHtml = '<li class=\"page-item prev\"><a href=\"#\" class=\"page-link prev\" title=\"이전페이지\" onclick=\"'+fn+'('+page.firstPageNo+');\">이전</a></li>';
		}
	}
	for (var i = page.firstPageNoOnPageList; i <= page.lastPageNoOnPageList; i++) {
		if (i == page.currentPageNo) {
			pagingHtml += '<li class=\"page-item active\"><a class=\"page-link active\">'+page.currentPageNo+'</a></li>';

		} else {
			pagingHtml += '<li class=\"page-item\"><a href=\"javascript:'+fn+'('+i+');\" class=\"page-link\">'+i+'</a></li>';
		}
	}

	if (page.totalPageCount > page.pageSize) {
		if (page.lastPageNoOnPageList < page.totalPageCount) {
			pagingHtml += '<li class=\"page-item next\"><a href=\"javascript:'+fn+'('+(page.firstPageNoOnPageList+ page.pageSize)+');\" class=\"page-link next\" title=\"다음페이지\">다음</a></li>';
			pagingHtml += '<li class=\"page-item last\"><a href=\"#\" class=\"page-link last\" title=\"마지막페이지\" onclick=\"'+fn+'('+page.lastPageNo+');\">끝</a></li>';
		} else {
			pagingHtml += '<li class=\"page-item next\"><a href=\"#\" class=\"page-link next\" title=\"다음페이지\" onclick=\"'+fn+'('+page.lastPageNo+'); \">다음</a></li>';
			pagingHtml += '<li class=\"page-item last\"><a href=\"#\" class=\"page-link last\" title=\"마지막페이지\" onclick=\"'+fn+'('+page.lastPageNo+'); \">끝</a></li>';
		}
	}
	return pagingHtml;
}

$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();

	$.each(a , function(){
		if (this.value == null || this.value ==''){
			return;
		}
		if(o[this.name]) {
			if(!o[this.name].push){
				o[this.name] = [o[this.name]];
			}
			 o[this.name].push(this.value ||'');
		}else{
			o[this.name] = this.value || '';
		}
	});
	return o;
}

/**********************************************
 * 공용 로그인 이동
**********************************************1*/
function login(siteUrl,param,springPofiles, paramMap){
	//넷퍼넬 추가
	var actId = "00";
	if(param == "01"){
		actId = "oprut_login_page";
	}else if (param == "02"){
		actId = "crrut_login_page";
	}else if (param == "03"){
		actId = "spcsv_login_page";
	}
	if( actId != "00" && springPofiles == "prod"){
		NetFunnel_Action({action_id:actId},function(ev,ret){
			setPagamData(form99, paramMap);
			form99.action = siteUrl;
			form99.siteCd.value = param;
			form99.submit();
		});
	}else{
		setPagamData(form99, paramMap);
		form99.action = siteUrl;
		form99.siteCd.value = param;
		form99.submit();
	}
}

function setPagamData(form, data){

    let params = {};
    let isRootArray = false; // 최상위 데이터가 배열인지 확인

    // 1. 데이터 타입별 정규화
    if (data instanceof FormData || data instanceof URLSearchParams) {
        data.forEach((value, key) => { params[key] = value; });
    } else if (typeof data === 'string') {
        try {
            params = JSON.parse(data);
            isRootArray = Array.isArray(params); // 파싱 후 배열인지 체크
        } catch (e) {
            new URLSearchParams(data).forEach((value, key) => { params[key] = value; });
        }
    } else if (Array.isArray(data)) {
        params = data;
        isRootArray = true;
    } else if (typeof data === 'object' && data !== null) {
        params = data;
    }

    // 2. input 생성 로직
    if (isRootArray) {
        // 최상위가 배열인 경우: 'data'라는 이름의 키로 전체를 JSON 문자열화
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data'; // 서버에서는 'data' 파라미터로 배열을 받게 됨
        input.value = JSON.stringify(params);
        form.appendChild(input);
    } else {
        // 일반 객체인 경우: 각 키를 input name으로 생성
        Object.keys(params).forEach(key => {
            const value = params[key];
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;

            if (value !== null && typeof value === 'object' && !(value instanceof File)) {
                input.value = JSON.stringify(value);
            } else {
                input.value = value === null ? '' : value;
            }
            form.appendChild(input);
        });
    }

}

/**********************************************
 * 공용 로그아웃 이동
**********************************************1*/
function logout(siteUrl,param){
	form99.action = siteUrl;
	form99.siteCd.value = param;
	form99.submit();
}

/**********************************************
 * 공용사이트 맵
**********************************************1*/
function siteMoveTab(siteUrl,param){
	localStorage.setItem("siteCd", param);
	fnSetCookie("siteCd", param, "", "/");

	form99.action = siteUrl;
	form99.siteCd.value = param;
	form99.submit();
}

function memberJoin(siteUrl,param){
	form99.action = siteUrl;
	form99.siteCd.value = param;
	form99.submit();
}

/**********************************************
 * 공용 개인정보 수정
**********************************************1*/
function memberInfoMod(siteUrl,param){
	form99.action = siteUrl;
	form99.siteCd.value = param;
	form99.submit();
}

/* ********************************************************
* 입력값이 한글인지 체크한다(한글만)
******************************************************** */
function isKorean(objValue) {
    var bool = true;

    if(objValue != null) objValue = trim(objValue);
    if(objValue == null || objValue == "") {
        bool = false;
    } else {
        for (var i=0; i<objValue.length; i++) {
            ch = objValue.charCodeAt(i);
            if(!((ch >= 0xAC00 && ch <= 0xD7A3) || (ch >= 0x3131 && ch <= 0x314E))) {
                bool = false;
                break;
            }
        }
    }

	return bool;
}

/*
 * 입력된 값의 양쪽 공백을 제거한다
 */
function trim(strt){
	if(strt == null) {
		strt  = "";
	} else {
		strt += "";
	}

	while(''+strt.charAt(0)==' ') {
		strt = strt.substring(1, strt.length);
	}

	while(''+strt.charAt(strt.length-1)==' ') {
    	strt = strt.substring(0, strt.length-1);
	}

	return strt;
}



//// 사용자 정의 alert 시작
// HTML 태그를 무력화하는 함수
function sanitizeHTML(str) {
    return (str == undefined || str == null) ? "":str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// 기존 alert 함수 재정의
window.alert = function(message, callback) {
    const sanitizedMessage = sanitizeHTML(message).replace(/\n/g, "<br>"); // HTML 태그 제거

	if ($("#custom-alert").length === 0) { // 해당 css에 스타일 넣어 두었으므로 style 태그 넣지 마세요~ 2025-06-20
	    $('body').append(`
	        <div id="custom-alert" style="">
	            <div id="custom-alert-box">
	                <p>`+sanitizedMessage+`</p>
	                <button id="close-alert" class="btn bg-skin text-wh">확인</button>
	            </div>
	        </div>
	    `);
	    // button focus
	    setTimeout(function() {
		    $("#close-alert").focus();
		}, 0);

	    // 확인 버튼 클릭 시 창 닫기
	    $('#close-alert').click(function() {
	        $('#custom-alert').remove();

	        if (callback)
	            callback();
	    });
	}
};
////사용자 정의 alert 종료

/**
 * 로딩 페이지 띄우는 함수
 * param1 : show/hide
 * param2 : 화면에 띄울 메세지
 */
function loadingSpinner(openFlag, message){
    if(openFlag){
    	const sanitizedMessage = sanitizeHTML(message).replace(/\n/g, "<br>"); // HTML 태그 제거
        $('body').append(`
        	<div id="mask" class="screen-loader active">
	        	<div class="screen-loader-txt">`+sanitizedMessage+`</div>
	        </div>
        `);
        $('#mask').show();
    } else {
        $('#mask').hide();
        $('#mask').remove();
    }
}

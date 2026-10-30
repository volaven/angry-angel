const _CapchaJS = {
	winPlayer: function(objUrl) {
		$('#audiocaptcha').html('<bgsound src="' + objUrl + '">');
	},

	fn_comCapchaAuth: function(inputAnswer, callback) {
		if($(inputAnswer).val() == ""){
			alert("숫자를 입력하세요.", function() {
				$(inputAnswer).focus();
			});

			return;
		}

		$.ajax({
			url : '/rccom/selectComCapchaAuth.do',
			type : 'POST',
			data : "answerNb="+$(inputAnswer).val(),
			dataType : 'json',
			contentType : "application/x-www-form-urlencoded;charset=UTF-8",
			success : function(data) {

				callback(true, data);

				/*
				if(data.data > 0){
					$("#captcha_info").html("<font color='red'>인증되었습니다.</font>");
					$("#capchaAuth").val("Y");
				}else{
					$("#captcha_info").html("<font color='red'>실패되었습니다.</font>");
					$("#capchaAuth").val("N");
				}
				*/

			},
			error : function() {
				callback(false, data);
				//$("#result").html('서버와의 통신에 에러가 발생하였습니다.');
			}
		});
	},
	// captcha 오디오 재생
	fn_audioCapcha: function() {
		let soundUrl = "/rccom/captchaAudio.do";
		let uAgent = navigator.userAgent;

		if (uAgent.indexOf('Trident') > -1 || uAgent.indexOf('MSIE') > -1) {
			this.winPlayer(soundUrl + '&agent=msie');
		} else if (!!document.createElement('audio').canPlayType) {
			try {
				new Audio(soundUrl).play();
			} catch (e) {
				this.winPlayer(soundUrl);
			}

		} else {
			window.open(soundUrl, '', 'width=1,height=1');
		}
	},
	// captcha 새로고침
	fn_regenCapcha: function(imgCaptcha) {
		let d = new Date();
		$(imgCaptcha).attr("src", "/rccom/captchaInfo.do?"+d.getTime());
	}
}

$(function(){
	//마우스 우클릭
	/*
	$(document).bind("contextmenu", function(e){ return false; });
	$(document).bind("selectstart", function(e){ return false; });
	$(document).bind("dragstart", function(e){ return false; });
	*/
});
// template_oprut.jsp에서 저장한 contextPath 호출
var contextPath = sessionStorage.getItem("contextPath");
/*
name : doPost
desc : post이동 (hidden 파라미터 사용)
param :
	actionNm : url 주소(.do 제외)
	paramNm : 파라미터 JSON 형태
 */
function doPost(actionNm, param){
	var paramHtml ="";
	//loadImg(true);		// 20240106. srhan. loadImg is not defined
	if(param != null){
		Object.keys(param).forEach(function(key){
				var paramHtmlStr = "<input type='hidden' name = '"+key+"' value = '"+param[key]+"'/>";
				paramHtml += paramHtmlStr;
			});
	}

	var goform = $("<form>"
				, {method:"post",
				   action:actionNm+".do",
				   html:paramHtml
				}).appendTo("body");
	goform.submit();
}

/**
	name : ajaxService
	desc : ajaxService
	author : KMS
 */

var isModal = false;

function ajaxService(url, param, callBack, async, type){

	/*if(!isModal){
		$('#bgShield').modal({
			modal : true
		  , clickClose : true
		  , escapeClose : true
		  , showClose : false
		});
	}*/

	var isAsync = (async==null) ? true : async;

	var contentType = (type==null) ? "application/x-www-form-urlencoded" : type;

	$.ajax({
		type : "POST"
	  , async : isAsync
	  , url : url
	  , dataType : "json"
	  , data : param
	  , contentType : contentType+";charset=utf-8"
	  , traditional : true
	  , success : function(result){

			execCallBack(callBack, result, param);
		}
	  , error : function(response, status, error){

			serviceError(response, status, error);
		}
	});

}

/**
	name : execCallBack
	desc : ServiceCallBack
	author : KMS
 */
function execCallBack(methodNm, result, param){

	if(methodNm){

		var callBack = window[methodNm];

		if(typeof callBack==="function")
			callBack(result, param);
		else
			alert("처리함수 "+methodNm+"을 찾을 수 없습니다.");

	}

}

/**
	name : serviceError
	desc : ajaxService Error Handler
	author : KMS
 */
function serviceError(response, status, error){

	try{
		var exMessage = $(response.responseText.trim()).filter("p#exMessage").text();
		var targetUrl = $(response.responseText.trim()).filter("p#targetUrl").text();
		if(exMessage){
			alert(exMessage);
			if(targetUrl)
				location.href = targetUrl;
		}else{
			if(error.toString().indexOf("<script>")>-1)
				alert("서비스 처리 중 에러가 발생했습니다.\n관리자에게 문의하세요");
			else
				alert(error);
		}
	}catch(ex){
		alert("통신장애가 발생했습니다.");
	}

}

function getFrstIdx(pageIdx, pageSize){
	return parseInt((pageIdx-1)/pageSize,10)*pageSize+1;
}

function getLastIdx(frstIdx, pageSize, pageCount){
	var lastIdx = frstIdx + pageSize - 1;
	if(lastIdx>pageCount)
		lastIdx = pageCount;
	return lastIdx;
}

function getQueryString(param){
	var queryString = "";
	$.each(param,function(key,val){
		queryString += queryString ? "&" : "?";
		queryString += key + "=" + escape(encodeURIComponent(val));
	});
	return queryString;
}

function getParam(queryString){
	var param = queryString.substring(1);
	var result = {};
	param = param.split("&");
	$.each(param,function(i){
		var name = param[i].split("=")[0];
		var value = decodeURIComponent(unescape(param[i].split("=")[1]));
		result[name] = value;
	});
	return result;
}

function getDateFormat(argDate, format){
	var dateMap = getDateMap(argDate);
	var result = "";
	while(format.length>0){
		var temp = format.charAt(0) + format.charAt(1);
		if(dateMap[temp]!=null){
			result += dateMap[temp];
			format = format.substring(2);
		}else{
			result += format.substring(0,1);
			format = format.substring(1);
		}
	}
	return result;
}

function getDateMap(argDate){
	var WK = new Array("일","월","화","수","목","금","토");
	var wk = new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
	var YY = argDate.getFullYear();
	var yy = String(YY).substring(2);
	var MM = ("0"+(argDate.getMonth()+1)).substring(("0"+(argDate.getMonth()+1)).length-2);
	var mm = Number(MM);
	var DD = ("0"+argDate.getDate()).substring(("0"+argDate.getDate()).length-2);
	var dd = Number(DD);
	var HH = ("0"+argDate.getHours()).substring(("0"+argDate.getHours()).length-2);
	var hh = Number(HH);
	var MI = ("0"+argDate.getMinutes()).substring(("0"+argDate.getMinutes()).length-2);
	var mi = Number(MI);
	var SS = ("0"+argDate.getSeconds()).substring(("0"+argDate.getSeconds()).length-2);
	var ss = Number(SS);
	var MS = ("00"+argDate.getMilliseconds()).substring(("00"+argDate.getSeconds()).length-3);
	var ms = Number(MS);
	var DY = WK[argDate.getDate()];
	var dy = wk[argDate.getDate()];
	var sh = (hh>12) ? hh - 12 : hh;
	var am = argDate.toLocaleTimeString().substring(0,2);
	var dateMap = {
		"YY" : YY
	  , "yy" : yy
	  , "MM" : MM
	  , "mm" : mm
	  , "DD" : DD
 	  , "dd" : dd
	  , "HH" : HH
	  , "hh" : hh
	  , "MI" : MI
	  , "mi" : mi
	  , "SS" : SS
	  , "ss" : ss
	  , "MS" : MS
	  , "ms" : ms
	  , "DY" : DY
	  , "dy" : dy
	  , "sh" : sh
	  , "am" : am
	}
	return dateMap;
}

function isEmpty(param, substit){

	var isEmpty = true;
	var value = "";

	if(param!=null){
		var split = new String(param).trim().split("\n");
		for(var i=0;i<split.length;i++){
			value += split[i];
		}
		if(value.length)
			isEmpty = false;
	}

	if(typeof substit=="undefined")
		return isEmpty;
	else
		return isEmpty ? substit : param;

}

function isValidFormat(format, value){
	var isValid = false;
	if(value.search(format)>-1)
		isValid = true;
	return isValid;
}

function cellTextMerge($cells){
	var tmpIdc = "";
	var tmpCnt = 0;
	var tmpIdx = 0;
	var rmvRow = {};
	$cells.each(function(i){
		if($(this).attr("indicator")==tmpIdc){
			$(this).addClass("remove");
			tmpCnt++;
			tmpIdx = i;
		}else{
			if(tmpIdx!=0&&tmpCnt!=0)
				rmvRow[tmpIdx-tmpCnt] = tmpCnt;
			tmpCnt = 0;
		}
		tmpIdc = $(this).attr("indicator");
	});
	if(tmpCnt>0)
		rmvRow[tmpIdx-tmpCnt] = tmpCnt;
	$.each(rmvRow,function(key,val){
		$cells.filter(":eq("+key+")").attr("rowspan",val+1);
	});
	$cells.filter(".remove").each(function(i){
		$(this).remove();
	});
}

function frstPage($container){
	var $html = $("<a href='#mpm' class='ctrl' title='처음' pageIdx='1'><i class='ri-arrow-left-double-fill'></i><span class='blind'>처음</span></a>").click(function(){
		movePage($(this).attr("pageIdx"));
	});
	$container.append($html);
}

function prevPage($container, pageIdx){
	var $html = $("<a href='#mpm' class='ctrl' title='이전' pageIdx='"+(Number(pageIdx)-1)+"'><i class='ri-arrow-left-s-line'></i><span class='blind'>이전</span></a>").click(function(){
		if(parseInt($(this).attr("pageIdx"),10)<=0)
			alert("페이지 목록의 처음입니다.")
		else
			movePage($(this).attr("pageIdx"));
	});
	$container.append($html);
}

function listPage($container, pageIdx, pageSize, pageCount){
	var frstIdx = getFrstIdx(pageIdx, pageSize);
	var lastIdx = getLastIdx(frstIdx, pageSize, pageCount);
	for(var i=frstIdx;i<=lastIdx;i++){
		var $html;
		if(i!=pageIdx){
			$html = $("<a href='#mpm' class='num' pageIdx='"+i+"'><p>"+i+"</p></a>").click(function(){
				movePage($(this).attr("pageIdx"));
			});
		}else{
			$html = $("<strong class='num active'>"+i+"<span class='blind'>현재 페이지</span></strong>");
		}
		$container.append($html);
	}
}

function nextPage($container, pageIdx){
	var $html = $("<a href='#mpm' class='ctrl' title='다음' pageIdx='"+(Number(pageIdx)+1)+"'><i class='ri-arrow-right-s-line'></i><span class='blind'>다음</span></a>").click(function(){
		if(parseInt($(this).attr("pageIdx"),10)>pageCount)
			alert("페이지 목록의 마지막입니다.")
		else
			movePage($(this).attr("pageIdx"));
	});
	$container.append($html);
}

function lastPage($container){
	var $html = $("<a href='#mpm' class='ctrl' title='마지막' pageIdx='"+pageCount+"'><i class='ri-arrow-right-double-fill'></i><span class='blind'>마지막</span></a>").click(function(){
		movePage($(this).attr("pageIdx"));
	});
	$container.append($html);
}


// 실명인증
var authRealname = function(callback, name, ssn) {

	$.ajax({
		type: 'post',
		url : '/ProxyNiceCI/authRealname.do',
		data: {
            ssn: crypt.encrypt(ssn)
            , name: crypt.encrypt(name)
        },
		dataType: 'json' ,
		success: function(result){

			callback(result);
		},
		error:function(error){

            callback(error);
		}
	});

};


function formatFileSize(fileSize){
	var formatFileSize;
	if(fileSize<1024)
		formatFileSize = Number(fileSize).toLocaleString()+"Bytes";
	else if(fileSize/1024/1024>=1)
		formatFileSize = (Math.round(fileSize/1024/1024*100)/100).toLocaleString()+"MB";
	else
		formatFileSize = (Math.round(fileSize/1024*100)/100).toLocaleString()+"KB";
	return formatFileSize;
}



var crypt;

$(function(){
	if(typeof CryptoJS !== 'undefined') {
		crypt = {
			key : CryptoJS.enc.Utf8.parse(cryptAesSecretkey)
			, iv : CryptoJS.enc.Utf8.parse(cryptAesSecretkey.substring(0, 16))
			, encrypt : function(plaintText) {
				let cipherText = CryptoJS.AES.encrypt(plaintText, crypt.key, {
				    iv: crypt.iv,
				    mode: CryptoJS.mode.CBC,
				    padding: CryptoJS.pad.Pkcs7
				}).toString();
				return cipherText;
			}
			, decrypt : function(encrypted) {
				var decrypted = CryptoJS.AES.decrypt(encrypted, crypt.key, {
				    iv: crypt.iv,
				    mode: CryptoJS.mode.CBC,
				    padding: CryptoJS.pad.Pkcs7
				});
				return decrypted.toString(CryptoJS.enc.Utf8);
			}
		};
	}
});


// 숫자 체크
function isNumber(val) {
    let Num = "1234567890";
    for (i=0; i<val.length; i++) {
        if (Num.indexOf(val.substring(i,i+1))<0) {
            return false;
        }
    }
    return true;
}

// 경채 2단계 메뉴 조회 (최상위 GNB)
//let getMainMenu = function() {
var getMainMenu = function() {
	let menu2Suc = false;
	$.ajax({
		type: 'post',
		url : '/cmmn/portalMenuLst.do',
		data: {
            menuLvNo: '2'
        },
        async:false,
		success: function(data){
			var html = '';
			$(data).each(function(){
				html += '<li class="nav-item dropdown">';
                html += 	'<a class="nav-link" data-toggle="dropdown" href="' + this.urlAddr + '">' + this.menuNm + '</a>';
                html += 	'<div class="nav-sub dropdown-menu" id="' + this.menuId + '">';
                html += '</div>';
                html += '</li>';
			});
			if(html != ''){
				$('#gnb').empty();
				$('#gnb').append(html);
			}
			menu2Suc = true;
		},
		complete:function(){
			if(menu2Suc){
				$.ajax({
					type: 'post',
					url : '/cmmn/portalMenuLst.do',
					data: {
			            menuLvNo: '3'
			        },
			        async:false,
					success: function(data){
						$(data).each(function(){
							let html = '';
							html += '<a class="sub-link" href="'+this.urlAddr+'">'+this.menuNm+'</a>';
							if(html != ''){
								$('#' + this.upMenuId).append(html);
							}
						});
					},
					error:function(error){
					}
				});
			}
		},
		error:function(error){
		}
	});
}

// 경채 3단계 메뉴 조회. 최상위 메뉴: 2단계
//let getMainMenu3 = function() {
var getMainMenu3 = function(siteCd) {
	$.ajax({
		type: 'post',
		url : '/cmmn/portalMenuLst.do',
		data: {
            menuLvNo: '3'
            ,siteCd: siteCd
        },
        async:false,
		success: function(data){
			$(data).each(function(){
				let html = '';
				html += '<a class="sub-link" href="'+this.urlAddr+'">'+this.menuNm+'</a>';
				if(html != ''){
					$('#' + this.upMenuId).append(html);
				}
			});
		},
		error:function(error){
		}
	});
};

// 경채 3단계 메뉴 조회. 최상위 메뉴: 2단계
//let getPresentMenuDepth = function(menuPath) {
var getPresentMenuDepth = function(menuPath) {
	$.ajax({
		type: 'post',
		url : '/cmmn/portalMenuDepth.do',
		data: {
            menuPath: menuPath
        },
        async:false,
		success: function(data){
			if(data != null && data != ''){
				return data.menuLvNo;
			}
		},
		error:function(error){
		}
	});
};

/**
 * 상단에 확대,축소,주소복사,프린트 기능
 * 2025.04.14 임시 주석처리 my pym
 */
/*
var nowZoom = 100;
function fn_zoomIn() {
	nowZoom = nowZoom + 10;

	document.body.style.zoom = nowZoom + "%";
}

function fn_zoomOut() {
	nowZoom = nowZoom - 10;

	document.body.style.zoom = nowZoom + "%";
}

function fn_clipboard() {
	const text = window.location.href;
	navigator.clipboard.writeText(text)
		.then(() => {
			alert("복사되었습니다.");
		});
}

function fn_print() {
	window.print();
}*/

function nuriPop(){
	pop_modal('공식 누리집 주소 확인하기','/rccom/moidPopup.do','')
}

/* ckEditor escape 처리 */
function _escapeHtml(text) {
	const escapeMap = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039'
	}
	return text.replace(/[&<>\""\"'"]/g, function(m) {return escapeMap[m]; });
}

// 팝업창 출력 함수 (PC, 모바일 분기대응)
function popupPrint(popupDivId, imageName){


	const isMobile = /Mobi|Android/i.test(navigator.userAgent);

	if(isMobile) {
		// 모바일일때는 이미지 다운로드
		if(imageName == undefined) imageName = "이미지";
		popupDownloadImage(popupDivId, imageName);
	} else {
		convertImagesToBase64(popupDivId);

		// PC 일때는 출력
		let sw = screen.width;
		let sh = screen.height;
		let w = 800;		// 팝업창 가로길이
		let h = 600;		// 팝업창 세로길이
		let xpos = (sw - w) / 2;		// 화면에 띄울 위치
		let ypos = (sh - h) / 2;		// 화면 중앙에 띄움

		let title = "";
		//let pHeader = "<html><head><link rel='stylesheet' href='${contextPath}/assets/bootstrap/css/bootstrap.min.css'></head><body>"
		let pHeader = "<html><head>";
		pHeader += "<link rel='stylesheet' href='" + contextPath + "/assets/bootstrap/css/bootstrap.min.css'>";
		pHeader += "<script type='text/javascript' src='/solution/pdfjs/js/html2canvas.js'></script>";
		pHeader += "<script type='text/javascript' src='/solution/pdfjs/js/jspdf.min.js'></script>";
		pHeader += "<style>";
		//pHeader += " @media print { @page { size:A4; margin:20mm; } }";
		pHeader += " body { margin: 0; font-size:12pt; }  ";
		pHeader += " .no-print { display:none !important; } ";
		pHeader += " .page-break { page-break-before: always; } ";
		pHeader += " .print-container {";
		pHeader += "   width: 210mm;";
		pHeader += "   min-height: 297mm;";
		pHeader += "   padding: 1mm;";
		pHeader += "   box-sizing: border-box;";
		pHeader += "   background : white;";
		pHeader += "   margin: auto;";
		pHeader += " }";
		pHeader += "</style>";
		pHeader += "</head>";
		let pContent = "<body>";
		pContent += "<div class='print-container'>";
		pContent += $('#' + popupDivId).html() + "<br>";
		pContent += "</div>";
		let pFooter = "</body></html>";

		let pPrintContent = pHeader + pContent + pFooter;

		pWin = window.open("", "print", "width=" + w + ",height=" + h + ",top=" + ypos + ",left=" + xpos + ",status=yes,scrollbars=yes");	// 동적인 새창 띄움
		//pWin.document.open();
		pWin.document.write(pPrintContent);
		setTimeout(() => {
			pWin.print();
			//pWin.document.close();
			//pWin.close();
		}, 500);
	}
}


//화면 이미지 다운로드
function popupDownloadImage(targetDiv, imageName) {
	var $target = $('#' + targetDiv);
	setTimeout(() =>{
		html2canvas($target[0], {
			useCORS : true,
			backgroundColor : "#ffffff",
			scale:1
		}).then(canvas => {
			canvas.toBlob(blob => {
				var blobUrl = URL.createObjectURL(blob);
				var a = document.createElement("a");
				a.href = blobUrl;
				a.download = imageName+".png"
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(blobUrl);
			}, 'image/png');
			//var myImage = canvas.toDataURL("image/png");
			//popupDownloadImageUri(myImage, (imageName+".png"));
		});
	},500);
}

function popupDownloadImageUri(uri, name) {

	let sw = screen.width;
	let sh = screen.height;
	let w = 800;		// 팝업창 가로길이
	let h = 600;		// 팝업창 세로길이
	let xpos = (sw - w) / 2;		// 화면에 띄울 위치
	let ypos = (sh - h) / 2;		// 화면 중앙에 띄움

	let title = "";

	let pHeader = ""
	let pContent = "<div><img src='C:/Users/USER/17600002025270267554155000000000002915.png'></div>"
	let pFooter = "";

	let pPrintContent = pHeader + pContent + pFooter;

	pWin = window.open("", "print", "width=" + w + ",height=" + h + ",top=" + ypos + ",left=" + xpos + ",status=yes,scrollbars=yes");	// 동적인 새창 띄움

	pWin.document.write(pPrintContent);

	var link = document.createElement("a")
	link.download = name;
	link.href = uri;
	pWin.document.body.appendChild(link);
	link.click();
	//pWin.close();
}

function convertImagesToBase64(popupDivId) {
	$('#' + popupDivId).find('img').each(function() {
		const img = this;
		const src = img.src;

		if(img.src.startsWith('data:image')) {
			return;
		}

		if(!img.complete || img.naturalWidth ===0) {
			return;
		}

		const canvas = document.createElement('canvas');
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;

		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);

		const dataURL = canvas.toDataURL('image/png');
		$(img).attr('src', dataURL);
	});
}

/**
 * 모든 데이터 타입을 지원하는 동적 Form POST Submit 공통 함수
 * @param {string} url - 요청을 보낼 엔드포인트 주소
 * @param {any} data - Object, JSON String, Array, FormData, URLSearchParams, Query String
 * 
 * --- Object ---
 * var sampleObject = {
 *   userId: "gemini_user",
 *   point: 1500,
 *   preferences: {
 *     theme: "dark",
 *      language: "ko"
 *   }
 * };
 * 
 * --- JSON String ---
 * var sampleJsonString = '{"orderNo": "20240520-001", "items": ["apple", "banana"]}';
 * 
 * 
 * --- Array --- 
 * var sampleArray = [
 *   { id: 1, action: "delete" },
 *   { id: 2, action: "skip" }
 * ];
 * 
 * --- FormData --- 
 * var sampleFormData = new FormData();
 * sampleFormData.append("category", "notice");
 * 
 * --- URLSearchParams --- 
 * var sampleSearchParams = new URLSearchParams();
 * sampleSearchParams.append("page", "1");
 * sampleSearchParams.append("search", "keyword");
 * 
 * --- Query String --
 * var sampleQueryString = "prodId=P12345&qty=2&coupon=SUMMER20";
 * 
 */

function com_postMovePage(url, data) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.style.display = 'none';

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

    // 3. 전송 및 삭제
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}


$(document).ready(function(){
	$("#comRemote").on("click", function(){
		  window.open("http://116.67.55.58:18080/remotecall", "_blank");
	});
})











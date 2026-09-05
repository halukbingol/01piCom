/*
 * softdev4u javascript library
 * tc.js
 * previously: softdev4u.js
 *
 */
 
/* Version history 
 * when who what
 *
 * 201503?? nt 
 * init
 *
 * 20150310 nt 
 * remote control for presentation
 *
 */



var inDevelopmentMode = true;

function softdev4u_init() {
    softdev4u_insertShowHideAnswerButtonsAndHideAnswers();
    softdev4u_replaceColumnClasses();
    softdev4u_transformOpenExample ();
    softdev4u_addFooterToMain ();
    softdev4u_addOverlay (); 
    softdev4u_addTOC();
    softdev4u_addHistory();
    softdev4u_addGoTo();
    softdev4u_resize();
    softdev4u_registerArrowKeyEvents();
    if (inDevelopmentMode) {
        softdev4u_replaceCopyrightWithFileName();    	
    }
}

function softdev4u_registerArrowKeyEvents() {
	$(document).keydown(function (eventObject) {
	    switch(eventObject.keyCode){
	    	case 37://left
	    		previousPage();
	    		break;
	    	case 38://up
	    		previousPage();
	    		break;
	    	case 39://right
	    		nextPage();
	    		break;
	    	case 40://down
	    		nextPage();
	    		break;
	    }
	});
}

function softdev4u_replaceCopyrightWithFileName() {
	var fileName = window.location + "";
	var lastPieceOfFileName = fileName.substr(fileName.lastIndexOf('/') + 1, fileName.length);
	$('.softdev4u-copyright').html(lastPieceOfFileName);
}

function softdev4u_transformOpenExample () {
    var openExampleDivList = $('.softdev4u-openExampleDiv');
    var openExampleDiv;
    var exampleName;
    var filePath;
    var lineNumber;
    var language;
    var openExampleLinkTitle;
    for (var i = 0; i < openExampleDivList.length; i++) {
        openExampleDiv = openExampleDivList[i];
        exampleName = $(openExampleDiv).attr('data-softdev4u-exampleName');
        filePath = $(openExampleDiv).attr('data-softdev4u-filePath');
		lineNumber = $(openExampleDiv).attr('data-softdev4u-lineNumber');
		language = $(openExampleDiv).attr('data-softdev4u-language');
		openExampleLinkTitle = $(openExampleDiv).attr('data-softdev4u-linkTitle');
        $(openExampleDiv).append('<button onclick="openExample(\''+exampleName+'\', \''+filePath+'\', '+lineNumber+', \''+language+'\');">'+openExampleLinkTitle+'</button>');
    }
}

function softdev4u_replaceColumnClasses() {
    var twoColumnList = $('.softdev4u-twoColumn');

    for (var i = 0; i < twoColumnList.length; i++) {
        var twoColumn = twoColumnList[i];

        $(twoColumn).addClass('container-fluid');

        var rowHtml = $(twoColumn).html();

        $(twoColumn).html('<div class="row">' + rowHtml + '</div>');
    }
    $('.softdev4u-columnOneOfTwo').addClass('col-sm-6');
    $('.softdev4u-columnTwoOfTwo').addClass('col-sm-6');

}

function softdev4u_resize() {
    var pageHeight = $('.softdev4u-page').height();
    var footerHeight = $('.softdev4u-footer').height();		
    var titleHeight = $('.softdev4u-title').height();
    $('.softdev4u-pageContent').height(pageHeight - footerHeight - titleHeight - 20);
}

function softdev4u_addOverlay() {
    $('body').append('<div onclick="softdev4u_hideOverlay();" class="softdev4u-overlay" style=" position: absolute; left: 0px; top: 0px; height: 100vh; width: 100vw; z-index: 10; background: rgba(255,255,255,.5);">');
    $('.softdev4u-overlay').hide();
}

function softdev4u_showOverlay() {
    $('.softdev4u-overlay').show();
}

function softdev4u_hideOverlay() {
	$('.softdev4u-toc-div').hide();
	$('.softdev4u-goto-div').hide();
    $('.softdev4u-overlay').hide();
    $(".softdev4u-history-div").hide();
}

function softdev4u_addTOC() {
    $("body").append('<div class="softdev4u-toc-div" style="left: ' + $('.softdev4u-toc-link').offset().left + 'px; bottom: ' + ($('.softdev4u-footer').height()) + 'px;"></div>');
    $(".softdev4u-toc-div").hide();
}

function softdev4u_openTOC() {
	softdev4u_hideOverlay();
    $(".softdev4u-toc-div").show();
    $('.softdev4u-overlay').show();
}

function softdev4u_addGoTo() {
	$("body").append('<div class="softdev4u-goto-div" style="position: absolute; left: ' + $('.softdev4u-pageNumber').offset().left + 'px; bottom: ' + ($('.softdev4u-footer').height()) + 'px; z-index: 11; " ><input type="number" name="quantity" min="1" max="1"><button onclick="softdev4u_goToPage();">GO</button></div>');
    $(".softdev4u-goto-div").hide();
}

function softdev4u_openGoTo() {
	softdev4u_hideOverlay()
	$(".softdev4u-goto-div").show();
    $('.softdev4u-overlay').show();
}

function softdev4u_goToPage () {
	var selectedPage = $('.softdev4u-goto-div input[type=number]').val();
	if (selectedPage < 1 || selectedPage > totalPageCount) {
		alert("Gecersiz sayfa");
	} else {
		softdev4u_hideOverlay();
		softdev4u_java_goToPage(selectedPage);
	}
}

function softdev4u_addContentToTOC(tocContent) {
    $('.softdev4u-toc-div').html(tocContent);
}

function softdev4u_addHistory() {
    $("body").append('<div class="softdev4u-history-div" style="position: absolute; left: ' + $('.softdev4u-navigation-up').offset().left + 'px; bottom: ' + ($('.softdev4u-footer').height()) + 'px; max-width: 50vw; max-height: 70vh; z-index: 11; background-color:red;"></div>');
    $(".softdev4u-history-div").hide();
}

function softdev4u_openHistory() {
	softdev4u_hideOverlay()
	$(".softdev4u-history-div").show();
    $('.softdev4u-overlay').show();
}

function softdev4u_addContentToHistory(historyContent) {
    $('.softdev4u-history-div').prepend(historyContent);
}

var softdev4u_historyTimer;

function softdev4u_historyTimerStart() {
    softdev4u_historyTimer = setInterval("softdev4u_openHistory ();clearInterval(softdev4u_historyTimer);", 2000);
}

function softdev4u_historyTimerStop() {
    clearInterval(softdev4u_historyTimer);
}

//function softdev4u_addFooterToMain() {
//    $(".softdev4u-page").append(
//            '<div class="softdev4u-footer">' +
//                '<small class="softdev4u-copyright">&copy; 2011 Some copyright message</small>' +
//                '<div class="softdev4u-navigation" style="width: 300px;">' +
//                    '<div style="float:left; width: 150px; text-align: center;">' +
//                        '<div style="float: left;"><a href="#" onclick="previousPage();"><span class="glyphicon glyphicon-chevron-left">&nbsp;&nbsp;</span></a></div>' +
//                        '<div style="float: right;"><a href="#" onclick="nextPage();">&nbsp;&nbsp;<span class="glyphicon glyphicon-chevron-right"></span></a></div>' +
//                        '<a href="#" onclick="softdev4u_openGoTo();" class="softdev4u-pageNumber"></a>' +
//                    '</div>' +
//                    '<div style="float:right; width: 100px;">' +
//                        '<div style="float: left;" class="softdev4u-navigation-up" onmouseover="softdev4u_historyTimerStart();" onmouseout="softdev4u_historyTimerStop();"><a href="#" onclick="getOut();"><span class="glyphicon glyphicon-chevron-up"></span></a></div>' +
//                        '<div class="softdev4u-toc-link"><a href="#" onclick="softdev4u_openTOC();">TOC</a></div>' +
//			'<div>&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="resetMeta();">R</a></div>'+
//		    '</div>' +
//                '</div>' +
//            '</div>');
//
//}

function softdev4u_addFooterToMain() {
	if (inDevelopmentMode) {
		   $(".softdev4u-page").append(
		            '<div class="softdev4u-footer">' +
		                '<small class="softdev4u-copyright">&copy; 2015 SD4U</small>' +
		                '<div class="softdev4u-navigation" style="width: 300px;">' +
		                    '<div style="float:left; width: 150px; text-align: center;">' +
		                        '<div style="float: left;"><a href="#" onclick="previousPage();"><span class="glyphicon glyphicon-chevron-left">&nbsp;&nbsp;</span></a></div>' +
		                        '<div style="float: right;"><a href="#" onclick="nextPage();">&nbsp;&nbsp;<span class="glyphicon glyphicon-chevron-right"></span></a></div>' +
		                        '<a href="#" onclick="softdev4u_openGoTo();" class="softdev4u-pageNumber"></a>' +
		                    '</div>' +
		                    '<div style="float:right; width: 100px;">' +
		                        '<div style="float: left;" class="softdev4u-navigation-up" onmouseover="softdev4u_historyTimerStart();" onmouseout="softdev4u_historyTimerStop();"><a href="#" onclick="getOut();"><span class="glyphicon glyphicon-chevron-up"></span></a></div>' +
		                        '<div class="softdev4u-toc-link"><a href="#" onclick="softdev4u_openTOC();">TOC</a></div>' +
		                        '<div>&nbsp;&nbsp;&nbsp;&nbsp;<a href="#" onclick="resetMeta();">R</a></div>'+
		                    '</div>' +
		                '</div>' +
		            '</div>');
	} else {
		$(".softdev4u-page").append(
				'<div class="softdev4u-footer">' +
                '<small class="softdev4u-copyright">&copy; 2015 SD4U</small>' +
                '<div class="softdev4u-navigation" style="width: 300px;">' +
                    '<div style="float:left; width: 150px; text-align: center;">' +
                        '<div style="float: left;"><a href="#" onclick="previousPage();"><span class="glyphicon glyphicon-chevron-left">&nbsp;&nbsp;</span></a></div>' +
                        '<div style="float: right;"><a href="#" onclick="nextPage();">&nbsp;&nbsp;<span class="glyphicon glyphicon-chevron-right"></span></a></div>' +
                        '<a href="#" onclick="softdev4u_openGoTo();" class="softdev4u-pageNumber"></a>' +
                    '</div>' +
                    '<div style="float:right; width: 100px;">' +
                        '<div style="float: left;" class="softdev4u-navigation-up" onmouseover="softdev4u_historyTimerStart();" onmouseout="softdev4u_historyTimerStop();"><a href="#" onclick="getOut();"><span class="glyphicon glyphicon-chevron-up"></span></a></div>' +
                        '<div class="softdev4u-toc-link"><a href="#" onclick="softdev4u_openTOC();">TOC</a></div>' +
                    '</div>' +
                '</div>' +
            '</div>');
	}

}

function softdev4u_insertShowHideAnswerButtonsAndHideAnswers() {
    $("<button type='button' onclick='softdev4u_showHideAnswerButtonClicked(this);' data-softdev4u-status='show'>Show Answer</button>").insertBefore(".softdev4u-answer");
    $(".softdev4u-answer").hide();
}

function softdev4u_showHideAnswerButtonClicked(button) {
    if ($(button).data('softdev4u-status') === 'show') {
        $(button).data('softdev4u-status', 'hide');
        $(button).html('Hide Answer');
        $(button).next().show();
    } else {
        $(button).data('softdev4u-status', 'show');
        $(button).html('Show Answer');
        $(button).next().hide();
    }
}

var totalPageCount;

function softdev4u_setPageNavigationData(pageNo, totalPage, hasLevels) {
	totalPageCount = totalPage;
	$('.softdev4u-goto-div input[type=number]').attr('max', totalPageCount);
	$('.softdev4u-goto-div input[type=number]').attr('value', pageNo);
	
    $('.softdev4u-pageNumber').html(pageNo + ' / ' + totalPageCount);
    if (hasLevels) {
        $('.softdev4u-navigation-up').show();
    } else {
        $('.softdev4u-navigation-up').hide();
    }
}
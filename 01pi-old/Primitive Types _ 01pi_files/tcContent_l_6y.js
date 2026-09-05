/*
 *	packSwe510
 */


// =============================================================== V
function setTitle(titleRunning, titleSlide) {
    // closely related to visual part of html
    // see 'F-bcd-visible.html'
    const titleRunning01pi =
        '<a href="https://www.01pi.com/" target="_blank">\n' +
        '<span class="a01pi-title-running">' +
        '   <img \n' +
        '      src="../../../../zintBundle/ZintLib/svg/01pi.svg" height="40" width="40"\n' +
        '      alt="01pi.com logo"/>\n' +
        '   01pi.com' +
        '</span>' +
        '</a>\n'
    ;
    titleRunning += titleRunning01pi;
    document.getElementById("idTitleRunning")
        .innerHTML = titleRunning;
    document.getElementById("idTitleSlide")
        .innerHTML = titleSlide;
} // setTitle

// =============================================================== V
function setSwitchCode(language, exampleName, filePath, lineNumber) {
    let elem = document.getElementById("idViewSwitchToCode");
    elem.setAttribute("class", "softdev4u-openExampleDiv");
    elem.setAttribute("data-softdev4u-language", language);
    elem.setAttribute("data-softdev4u-exampleName", exampleName);
    elem.setAttribute("data-softdev4u-filePath", filePath);
    elem.setAttribute("data-softdev4u-lineNumber", lineNumber);
    elem.setAttribute("data-softdev4u-linkTitle", 'Switch to code');
    // <div class="softdev4u-openExampleDiv" 
    //     data-softdev4u-language="Java" 
    //     data-softdev4u-exampleName="Operators" 
    //     data-softdev4u-filePath="src/codes/teaching/java/operators/WholeNumbers.java" 
    //     data-softdev4u-lineNumber=35
    //     data-softdev4u-linkTitle="Switch to code"> 
    // </div> 
} // setSwitchCode

// =============================================================== V
function softdev4uContent_init() {
    sd4uContentDivRemark();
    sd4uContentDivDefinition();
    sd4uContentDivTheorem();
}

// =============================================================== V
function sd4uContentDivRemark() {
    $('.sd4uDivRemark').prepend('<b>Remark</> ');
}

// =============================================================== V
function sd4uContentDivDefinition() {
    $('.sd4uDivDefinition').prepend('<b>Definition</> ');
}

// =============================================================== V
function sd4uContentDivTheorem() {
    $('.sd4uDivTheorem').prepend('<b>Theorem</> ');
}


// @HB
// Do You Know test
// =============================================================== V
function hb_insertShowHideButtonsAndHideAnswers() {
    $("<button type='button' onclick='hb_showHideButtonClicked(this, 'Hide', 'Do you know');' data-softdev4u-status='show'>Do you know</button>").insertBefore(".softdev4u-answer");
    $(".softdev4u-answer").hide();
}

// =============================================================== V
function hb_showHideButtonClicked(button, strClicked, strClickedUn) {
    if ($(button).data('softdev4u-status') === 'show') {
        $(button).data('softdev4u-status', 'hide');
        $(button).html(strClicked);
        $(button).next().show();
    } else {
        $(button).data('softdev4u-status', 'show');
        $(button).html(strClickedUn);
        $(button).next().hide();
    }
}


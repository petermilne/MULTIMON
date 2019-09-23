/** who.js - pgm js playground */

function getFirst(doc, tag) {
    return doc.getElementsByTagName(tag)[0].firstChild;
}

var idx = 0;
var idx = 0;


function showDiffs(resultData, row, old) {
    var myRow = resultData[row]
    var rs = new Array();
    // even rows: same, odd rows: different

    if (old[row].length == 0) {
        old = myRow;
        rs[0] = '';
        rs[1] = myRow;
    } else {
        var oldRow = old;
        var different = 0;
        var field = 0;
        var left = 0;
        for (right = 0; right != myRow.length; ++right) {
            if (different) {
                if (myRow[right] == oldRow[right] || myRow[right] == ' ') {
                    rs[field++] = myRow.substring(left, right);
                    different = 0;
                    left = right;
                }
            } else {
                if (myRow[right] != oldRow[right]) {
                    rs[field++] = myRow.substring(left, right);
                    different = 1;
                    left = right;
                }
            }
        }

        rs[field++] = myRow.substring(left, right);
    }
    return rs;
}
var dt = {
    URL: 'gen.cgi',
    command: 'nothing',
    args: '',
    argnames: '',
    anchor: document.getElementById('result'),
    whotab: 0,
    resultCache: new Array(),
    first_time: 1,

    wantsRefresh: 0,
    refreshState: 0,

    setArgs: function(_args) {
        dt.args = _args;
        var myargs = _args.split(/;/);
        dt.argnames = new Array();
        for (ix = 0; ix < myargs.length; ++ix) {
            dt.argnames[ix] = myargs[ix].split(/=/)[0];
        }
    },
    showResponse: function(originalRequest) {

        var rxml = originalRequest.responseXML;

        if (dt.refreshState) {
            dt.refreshState.firstChild.nodeValue = "";
        }

        if ($('host') == null) {
            return;
            // doc not ready yet
        }

	$('host').firstChild.nodeValue = 
		getFirst(rxml, 'host').nodeValue;

        $('date').firstChild.nodeValue =
		getFirst(rxml, 'date').nodeValue;
        $('uptime').firstChild.nodeValue =
		getFirst(rxml, 'uptime').nodeValue;
/*

        if (dt.command != 'nothing') {
            dt.showResult(rxml);
        }
        if (dt.argnames.length) {
            dt.showCustom(rxml, dt.argnames);
        }
*/	

        dt.first_time = 0;
    },
    makeRequest: function () {
        var prams = '';
        var method = 'get';

        if (dt.args != '') {
            prams = dt.args;
            method = 'post'
        } else if (dt.command != '') {
            prams += 'command="' + dt.command + '"';
        }


        if (dt.first_time || (dt.wantsRefresh && dt.wantsRefresh.checked)) {
            if (dt.refreshState) {
                dt.refreshState.firstChild.nodeValue = "busy";
            }

            new Ajax.Request(dt.URL, {
                method: method,
                parameters: prams,
                onComplete: dt.showResponse});


        }

	new XSLTHelper(dt.URL, dt.xsl, '').loadView($('results'));

    },


    showPre: function(rxml, domName, xmlName) {

        var resultData = getFirst(rxml, xmlName).nodeValue.split(/\n/);
        var anchor = document.getElementById(domName);
        var oldResults;
        var first_time = 0;

        if (anchor == 0) {
            return;
        }
        var newEl = document.createElement('table');
        newEl.setAttribute('class', "pretab");

        if ((oldResults = dt.resultCache[domName]) == null) {
            dt.resultCache[domName] = oldResults = new Array();
            first_time = 1;
        }

        for (row = 0; row < resultData.length; row++) {
            var rowElement = document.createElement('tr');
            var td = document.createElement('td');
            td.setAttribute('class', "pretab");

            if (first_time) {
                oldResults[row] = resultData[row];
            }
            if (resultData[row] == oldResults[row]) {
                var pre = document.createElement('pre');
                pre.appendChild(document.createTextNode(resultData[row]));
                td.appendChild(pre);
                // unchanged data - why change the DOM?
            } else {
                var rs = showDiffs(resultData, row, oldResults[row]);
                var modeEl = document.createElement('pre');
                for (field = 0; field != rs.length; ++field) {
                    if (field & 1) {
                        var bold = document.createElement('u');
                        bold.appendChild(document.createTextNode(rs[field]));
                        bold.setAttribute("class", "vchanged");
                        modeEl.appendChild(bold);
                    } else {
                        modeEl.appendChild(document.createTextNode(rs[field]));
                    }
                }
                td.appendChild(modeEl);
            }
            oldResults[row] = resultData[row];

            rowElement.appendChild(td);
            newEl.appendChild(rowElement);

        }
        if (++idx > row) idx = 0;


        while (anchor.hasChildNodes()) {
            anchor.removeChild(anchor.firstChild);
        }
        anchor.appendChild(newEl);
    },
    showResult: function (rxml) {
        dt.showPre(rxml, 'result', 'result');
    },
    showCustom: function (rxml, names) {
        for (n = 0; n < names.length; ++n) {
            dt.showPre(rxml, names[n], names[n]);
        }
    },
    init: function() {
        dt.wantsRefresh = document.getElementById('refresh');
        dt.refreshState = document.getElementById('refresh_state');
    }
};


function addListeners() {
    dt.init();
    PeriodicalExecuter.prototype.initialize(dt.makeRequest, 1);
}

function println(str) {
     var console = document.getElementById('console');
    while (console.hasChildNodes()) {
        console.removeChild(console.firstChild);
    }
    console.appendChild(document.createTextNode(str));
}
Event.observe(window, 'load', addListeners, false);
//Event.observe(window, 'hide', StopTheClock, false);


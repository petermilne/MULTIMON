//-------------------- mContentLoader.js
var net = new Object();

net.READY_STATE_UNINITIALIZED = 0;
net.READY_STATE_LOADING = 1;
net.READY_STATE_LOADED = 2;
net.READY_STATE_INTERACTIVE = 3;
net.READY_STATE_COMPLETE = 4;

net.ContentLoader = function(component, url, method, requestParams) {
    this.component = component;
    this.url = url;
    this.requestParams = requestParams;
    this.method = method;
}


function getFirst(doc, tag) {
    return doc.getElementsByTagName(tag)[0].firstChild;
}

function println(str) {
    var console = document.getElementById('console');
    if (console != null)
        console.appendChild(document.createTextNode(str + "\n"));
}


net.ContentLoader.prototype = {

    getTransport: function() {
        var transport;
        if (window.XMLHttpRequest)
            transport = new XMLHttpRequest();
        else if (window.ActiveXObject) {
            try {
                transport = new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch(err) {
                transport = new ActiveXObject('Microsoft.XMLHTTP');
            }
        }
        return transport;
    },

    sendRequest: function() {

        //if ( window.netscape && window.netscape.security.PrivilegeManager.enablePrivilege)
        //   netscape.security.PrivilegeManager.enablePrivilege('UniversalBrowserRead');

        var requestParams = []
        for (var i = 0; i < arguments.length; i++)
            requestParams.push(arguments[i]);

        var oThis = this;
        var request = this.getTransport();
        request.open(this.method, this.url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.onreadystatechange = function() {
            oThis.handleAjaxResponse(request)
        };
        request.send(this.queryString(requestParams));
    },

    queryString: function(args) {

        var requestParams = [];
        for (var i = 0; i < this.requestParams.length; i++)
            requestParams.push(this.requestParams[i]);
        for (var j = 0; j < args.length; j++)
            requestParams.push(args[j]);

        var queryString = "";
        if (requestParams && requestParams.length > 0) {
            for (var i = 0; i < requestParams.length; i++)
                queryString += requestParams[i] + '&';
            queryString = queryString.substring(0, queryString.length - 1);
        }
        return queryString;
    },

    handleAjaxResponse: function(request) {
        if (request.readyState == net.READY_STATE_COMPLETE) {
            if (this.isSuccess(request))
                this.component.ajaxUpdate(request);
            else
                this.component.handleError(request);
        }
    },

    isSuccess: function(request) {
        return  request.status == 0
                || (request.status >= 200 && request.status < 300);
    }

};


//-------------------- mLiveSearch.js

function LiveSearch(pageURL, lookupField, xmlURL, xsltURL, filter, options) {
    this.pageURL = pageURL;
    this.lookupField = lookupField;
    this.xmlURL = xmlURL;
    this.xsltURL = xsltURL;
    this.filter = filter;
    this.setOptions(options);

    var oThis = this;
    lookupField.form.onsubmit = function() {
        oThis.doSearch();
        return false;
    };
    this.initialize();
    println('filter is ' + filter);
}

LiveSearch.prototype = {

    doSearch: function() {
        if (XSLTHelper.isXSLTSupported())
            this.doAjaxSearch();
        else
            this.submitTheForm();
    },

    setOptions: function(options) {
        this.options = options;

        if (!this.options.loadingImage) this.options.loadingImage = 'images/loading.gif';
        if (!this.options.bookmarkContainerId) this.options.bookmarkContainerId = 'bookmark';
        if (!this.options.resultsContainerId) this.options.resultsContainerId = 'results';
        if (!this.options.bookmarkText) this.options.bookmarkText = 'Bookmark Search';
    },

    initialize: function() {
        var currentLocation = document.location.href;
        var qIndex = currentLocation.indexOf('q=');
        println("LiveSearch.initialize " + qIndex);
        if (qIndex != -1) {
            this.lookupField.value = currentLocation.substring(qIndex + 2);
            // @todo pgmwashere ... force doSearch() regardless
        }
        this.doSearch();
    },

    doAjaxSearch: function() {
        if (!this.options.append) {
            this.showLoadingImage();
        }
        var searchUrl = this.appendToUrl(this.xmlURL, 'q', this.lookupField.value);
        new XSLTHelper(searchUrl, this.xsltURL, this.filter).loadView(
                this.options.resultsContainerId, this.options.append, this.options.appendage);
        this.updateBookmark();
    },

    submitTheForm: function() {
        var searchForm = this.lookupField.form;
        searchForm.onsubmit = function() {
            return true;
        };
        searchForm.submit();
    },

    showLoadingImage: function() {
        var newImg = document.createElement('img');
        newImg.setAttribute('src', this.options.loadingImage);
        document.getElementById(this.options.resultsContainerId).appendChild(newImg);
    },

    appendToUrl: function(url, name, value) {
        var separator = '?';
        if (url.indexOf(separator) > 0)
            separator = '&';

        return url + separator + name + '=' + value;
    },

    updateBookmark: function() {
        var container = document.getElementById(this.options.bookmarkContainerId);
        var bookmarkURL = this.appendToUrl(this.pageURL, 'q', this.lookupField.value);
        if (container)
            container.innerHTML = '<a href="' + bookmarkURL + '" >' +
                                  this.options.bookmarkText + '</a>';
    }
}


//-------------------- mxsltHelper.js

function XSLTHelper(xmlURL, xslURL, filter) {
    this.xmlURL = xmlURL;
    this.xslURL = xslURL;
    this.filter = "'" + filter + "'";
    this.filePat = /q=([0-9]+)/;
}

XSLTHelper.isXSLTSupported = function() {
    return (window.XMLHttpRequest && window.XSLTProcessor ) ||
           XSLTHelper.isIEXmlSupported();
}

XSLTHelper.isIEXmlSupported = function() {
    if (! window.ActiveXObject)
        return false;
    try {
        new ActiveXObject("Microsoft.XMLDOM");
        return true;
    }
    catch(err) {
        return false;
    }
}

XSLTHelper.prototype = {

    loadView: function(container, append, appendage) {
        if (! XSLTHelper.isXSLTSupported())
            return;

        this.xmlDocument = null;
        this.xslStyleSheet = null;
        this.container = $(container);
        this.append = append;
        this.appendage = appendage;
        this.request = 'default';

        new Ajax.Request(this.xmlURL,
        {onComplete: this.setXMLDocument.bind(this)});
        new Ajax.Request(this.xslURL,
        {method: "GET",
            onComplete: this.setXSLDocument.bind(this)});
    },

    setXMLDocument: function(request) {
        this.request = request;
        this.xmlDocument = request.responseXML;
        this.updateViewIfDocumentsLoaded();
    },

    setXSLDocument: function(request) {
        this.xslStyleSheet = request.responseXML;
        if (this.filter != null) {
            var elements = this.xslStyleSheet.getElementsByTagName('variable');
            for (i = 0; i != elements.length; ++i) {
                if (elements[i].getAttribute('name') == 'levelMatch') {
                    elements[i].setAttribute('select', this.filter);
                }

                if (elements[i].getAttribute('name') == 'sourceFile') {
                    var logn = this.xmlURL.match(this.filePat);
                    if (logn.length != 0){
                        logn = logn[1];
                    }else{
                        logn = "no match";
                    }
                    elements[i].setAttribute('select', "'" + logn + "'");
                }

            }
        }

        this.updateViewIfDocumentsLoaded();
    },

    updateViewIfDocumentsLoaded: function() {
        if (this.xmlDocument == null || this.xslStyleSheet == null)
            return;
        this.updateView();
    },

    updateView: function () {
        if (! XSLTHelper.isXSLTSupported())
            return;

        if (window.XMLHttpRequest && window.XSLTProcessor)
            this.updateViewMozilla();
        else if (window.ActiveXObject)
            this.updateViewIE();

        if (this.appendage != null) {
            this.appendage();
        }
    },

    updateViewMozilla: function() {
        var xsltProcessor = new XSLTProcessor();
        xsltProcessor.importStylesheet(this.xslStyleSheet);
        var fragment = xsltProcessor.transformToFragment(this.xmlDocument, document);
        if (typeof(fragment)  != 'undefined' && 
            typeof(fragment.childnodes) != 'undefined' &&
            typeof(fragment.childnodes[0].childnodes) != 'undefined' &&
            typeof(fragment.childnodes[0].childnodes[0].childnodes) != 'undefined' &&
            typeof(fragment.childnodes[0].childnodes[0].childnodes[0].childnodes) != 'undefined') {

//        alert(fragment.childNodes)
if (0){
	alert("#2 "+fragment.childNodes[0].childNodes[0].toString());
	alert("#3 "+fragment.childNodes[0].childNodes[0].childNodes[0].toString());
	alert("#4 "+fragment.childNodes[0].childNodes[0].
			childNodes[0].childNodes[0].toString());
	alert("#5 "+fragment.childNodes[0].childNodes[0].
			childNodes[0].childNodes[0].nodeValue);
}
   	    var txt = fragment.childNodes[0].childNodes[0].
                            childNodes[0].childNodes[0].nodeValue;
	    var pat = /XML.*Error/;

	    if (!pat.test(txt)){	
        	if (!this.append) {
	            this.container.innerHTML = "";
       		}
	        this.container.appendChild(fragment);
	    }
	}
        else {
                if (!this.append) {
                    this.container.innerHTML = "";
                }
                this.container.appendChild(fragment);
        } 
   },

    updateViewIE: function(container) {
        if (!this.append) {
             this.container.innerHTML = "";
         }
//          alert(this.xmlDocument.transformNode(this.xslStyleSheet));
          this.container.appendChild(this.xmlDocument.transformNode(this.xslStyleSheet));
    }

}

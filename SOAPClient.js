/**
 *
 * Javascript "SOAP Client" library
 *
 * @version: 2.5 - 2014.08.18
 * @license: Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * @author: Matteo Casati - http://www.guru4.net/
 * @author: André Fiedler - http://visualdrugs.net/
 *
 * version: 2.4 - 2007.12.21
 */
function SOAPClientParameters() {
    var parameterList = new Array();
    this.add = function(name, value) {
        parameterList[name] = value;
        return this;
    };
    this.toXml = function() {
        var xml = '';
        for (var parameter in parameterList) {
            switch (typeof(parameterList[parameter])) {
                case 'string':
                case 'number':
                case 'boolean':
                case 'object':
                    xml += '<' + parameter + '>' + SOAPClientParameters.serialize(parameterList[parameter]) + '</' + parameter + '>';
                    break;
                default:
                    break;
            }
        }
        return xml;
    };
}

SOAPClientParameters.serialize = function(obj) {
    var str = '', parameter;
    switch (typeof(obj)) {
        case 'string':
            str += obj.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            break;
        case 'number':
        case 'boolean':
            str += obj.toString();
            break;
        case 'object':
            if (obj instanceof Date) {
                var year = obj.getFullYear().toString();
                var month = (obj.getMonth() + 1).toString();
                month = (month.length == 1) ? '0' + month : month;
                var date = obj.getDate().toString();
                date = (date.length == 1) ? '0' + date : date;
                var hours = obj.getHours().toString();
                hours = (hours.length == 1) ? '0' + hours : hours;
                var minutes = obj.getMinutes().toString();
                minutes = (minutes.length == 1) ? '0' + minutes : minutes;
                var seconds = obj.getSeconds().toString();
                seconds = (seconds.length == 1) ? '0' + seconds : seconds;
                var milliseconds = obj.getMilliseconds().toString();
                var tzminutes = Math.abs(obj.getTimezoneOffset());
                var tzhours = 0;
                while (tzminutes >= 60) {
                    tzhours++;
                    tzminutes -= 60;
                }
                tzminutes = (tzminutes.toString().length == 1) ? '0' + tzminutes.toString() : tzminutes.toString();
                tzhours = (tzhours.toString().length == 1) ? '0' + tzhours.toString() : tzhours.toString();
                var timezone = ((obj.getTimezoneOffset() < 0) ? '+' : '-') + tzhours + ':' + tzminutes;
                str += year + '-' + month + '-' + date + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds + timezone;
            } else if (obj instanceof Array) {
                for (parameter in obj) {
                    if (!isNaN(parameter)) // linear array
                    {
                        (/function\s+(\w*)\s*\(/ig).exec(obj[parameter].constructor.toString());
                        var type = RegExp.$1;
                        switch (type) {
                            case '':
                                type = typeof(obj[parameter]);
                                break;
                            case 'String':
                                type = 'string';
                                break;
                            case 'Number':
                                type = 'int';
                                break;
                            case 'Boolean':
                                type = 'bool';
                                break;
                            case 'Date':
                                type = 'DateTime';
                                break;
                            default:
                                break;
                        }
                        str += '<' + type + '>' + SOAPClientParameters.serialize(obj[parameter]) + '</' + type + '>';
                    } else { // associative array
                        str += '<' + parameter + '>' + SOAPClientParameters.serialize(obj[parameter]) + '</' + parameter + '>';
                    }
                }
            }
            // Object or custom function
            else {
                for (parameter in obj) {
                    str += '<' + parameter + '>' + SOAPClientParameters._serialize(obj[parameter]) + '</' + parameter + '>';
                }
            }
            break;
        default:
            throw new Error('SOAPClientParameters: type "' + typeof(obj) + '" is not supported');
    }
    return s;
};

function SOAPClient() {}

SOAPClient.username = null;
SOAPClient.password = null;

SOAPClient.invoke = function(url, method, parameters, async, callback) {
    if (async) {
        return SOAPClient.loadWsdl(url, method, parameters, async, callback);
    } else {
        return SOAPClient.loadWsdl(url, method, parameters, async, callback);
    }
};

// private: wsdl cache
SOAPClientWsdlCache = new Array();

// private: invoke async
SOAPClient.loadWsdl = function(url, method, parameters, async, callback) {
    // load from cache?
    var wsdl = SOAPClientWsdlCache[url];
    if (!!wsdl) {
        return SOAPClient.sendSoapRequest(url, method, parameters, async, callback, wsdl);
    }
    // get wsdl
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('GET', url + '?wsdl', async);
    if (async) {
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                SOAPClient.onLoadWsdl(url, method, parameters, async, callback, xmlHttp);
            }
        };
    }
    xmlHttp.send(null);
    if (!async) {
        return SOAPClient.onLoadWsdl(url, method, parameters, async, callback, xmlHttp);
    }
};

SOAPClient.onLoadWsdl = function(url, method, parameters, async, callback, req) {
    var wsdl = req.responseXML;
    SOAPClientWsdlCache[url] = wsdl; // save a copy in cache
    return SOAPClient.sendSoapRequest(url, method, parameters, async, callback, wsdl);
};

SOAPClient.sendSoapRequest = function(url, method, parameters, async, callback, wsdl) {
    // get namespace
    var ns = (!wsdl.documentElement.attributes['targetNamespace']) ? wsdl.documentElement.attributes.getNamedItem('targetNamespace').nodeValue : wsdl.documentElement.attributes['targetNamespace'].value;
    // build SOAP request
    var request =
        '<?xml version="1.0" encoding="utf-8"?>' +
        '<soap:Envelope ' +
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
        'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
        'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<soap:Body>' +
        '<' + method + ' xmlns="' + ns + '">' +
        parameters.toXml() +
        '</' + method + '></soap:Body></soap:Envelope>';
    // send request
    var xmlHttp = new XMLHttpRequest();
    if (SOAPClient.userName && SOAPClient.password) {
        xmlHttp.open('POST', url, async, SOAPClient.userName, SOAPClient.password);
        // Some WS implementations (i.e. BEA WebLogic Server 10.0 JAX-WS) don't support Challenge/Response HTTP BASIC, so we send authorization headers in the first request
        xmlHttp.setRequestHeader('Authorization', 'Basic ' + SOAPClient.toBase64(SOAPClient.userName + ':' + SOAPClient.password));
    } else {
        xmlHttp.open('POST', url, async);
    }
    var soapaction = ((ns.lastIndexOf('/') !== ns.length - 1) ? ns + '/' : ns) + method;
    xmlHttp.setRequestHeader('SOAPAction', soapaction);
    xmlHttp.setRequestHeader('Content-Type', 'text/xml; charset=utf-8');
    if (async) {
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4) {
                SOAPClient.onSendSoapRequest(method, async, callback, wsdl, xmlHttp);
            }
        };
    }
    xmlHttp.send(sr);
    if (!async) {
        return SOAPClient.onSendSoapRequest(method, async, callback, wsdl, xmlHttp);
    }
};

SOAPClient.onSendSoapRequest = function(method, async, callback, wsdl, req) {
    var obj = null;
    var nd = req.responseXML.getElementsByTagName(method + 'Result');
    if (nd.length === 0) {
        nd = req.responseXML.getElementsByTagName('return'); // PHP web Service?
    }
    if (nd.length === 0) {
        if (req.responseXML.getElementsByTagName('faultcode').length > 0) {
            if (async || callback) {
                obj = new Error(req.responseXML.getElementsByTagName('faultstring')[0].childNodes[0].nodeValue);
            } else {
                throw new Error(req.responseXML.getElementsByTagName('faultstring')[0].childNodes[0].nodeValue);
            }
        }
    } else {
        obj = SOAPClient.soapresult2object(nd[0], wsdl);
    }
    if (callback) {
        callback(obj, req.responseXML);
    }
    if (!async) {
        return obj;
    }
};

SOAPClient.soapresult2object = function(node, wsdl) {
    var wsdlTypes = SOAPClient.getTypesFromWsdl(wsdl);
    return SOAPClient.node2object(node, wsdlTypes);
};

SOAPClient.node2object = function(node, wsdlTypes) {
    var i, len;
    // null node
    if (!node) {
        return null;
    }
    // text node
    if (node.nodeType === 3 || node.nodeType === 4) {
        return SOAPClient.extractValue(node, wsdlTypes);
    }
    // leaf node
    if (node.childNodes.length === 1 && (node.childNodes[0].nodeType === 3 || node.childNodes[0].nodeType === 4)) {
        return SOAPClient.node2object(node.childNodes[0], wsdlTypes);
    }
    var isarray = SOAPClient.getTypeFromWsdl(node.nodeName, wsdlTypes).toLowerCase().indexOf('arrayof') !== -1;
    // object node
    if (!isarray) {
        var obj = null;
        if (node.hasChildNodes()) {
            obj = new Object();
        }
        for (i = 0, len = node.childNodes.length; i < len; i++) {
            var parameter = SOAPClient.node2object(node.childNodes[i], wsdlTypes);
            obj[node.childNodes[i].nodeName] = parameter;
        }
        return obj;
    }
    // list node
    else {
        // create node ref
        var list = new Array();
        for (i = 0, len = node.childNodes.length; i < len; i++) {
            list.push(SOAPClient.node2object(node.childNodes[i], wsdlTypes));
        }
        return list;
    }
    return null;
};

SOAPClient.extractValue = function(node, wsdlTypes) {
    var value = node.nodeValue;
    switch (SOAPClient.getTypeFromWsdl(node.parentNode.nodeName, wsdlTypes).toLowerCase()) {
        case 's:boolean':
            return value == 'true';
        case 's:int':
        case 's:long':
            return (!value) ? 0 : parseInt(value, 10);
        case 's:double':
            return (!value) ? 0 : parseFloat(value);
        case 's:datetime':
            if (!value) {
                return null;
            } else {
                value = value + '';
                value = value.substring(0, (value.lastIndexOf('.') == -1 ? value.length : value.lastIndexOf('.')));
                value = value.replace(/T/gi, ' ');
                value = value.replace(/-/gi, '/');
                var date = new Date();
                date.setTime(Date.parse(value));
                return date;
            }
        case 's:string':
        default:
            return (!value) ? '' : value;
    }
};

SOAPClient.getTypesFromWsdl = function(wsdl) {
    var wsdlTypes = new Array();
    // IE
    var elements = wsdl.getElementsByTagName('s:element');
    var useNamedItem = true;
    // MOZ
    if (elements.length === 0) {
        elements = wsdl.getElementsByTagName('element');
        useNamedItem = false;
    }
    for (var i = 0, len = elements.length; i < len; i++) {
        if (useNamedItem) {
            if (!!elements[i].attributes.getNamedItem('name') && !!elements[i].attributes.getNamedItem('type')) {
                wsdlTypes[elements[i].attributes.getNamedItem('name').nodeValue] = elements[i].attributes.getNamedItem('type').nodeValue;
            }
        } else {
            if (!!elements[i].attributes['name'] && !!elements[i].attributes['type']) {
                wsdlTypes[elements[i].attributes['name'].value] = elements[i].attributes['type'].value;
            }
        }
    }
    return wsdlTypes;
};

SOAPClient.getTypeFromWsdl = function(elementname, wsdlTypes) {
    var type = wsdlTypes[elementname];
    return (!type) ? '' : type;
};

SOAPClient.toBase64 = function(str) {
    return btoa(unescape(encodeURIComponent(str)));
};

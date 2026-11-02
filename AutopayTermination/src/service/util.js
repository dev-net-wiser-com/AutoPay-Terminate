// HTML5-Base common 2022.10.05
export const XMLToObject = (xmlText) => {
  let text = xmlText;

  let xmlDoc;
  let parser;
  if (window.ActiveXObject) {
    xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = "false";
    xmlDoc.loadXML(text);
  } else {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(text, "text/xml");
  }
  return xmlDoc;
}

export const saveSession = (name, value) => {
  if (typeof (value) == "object") {
    value = JSON.stringify(value);
  }
  sessionStorage[name] = value;
}
export const getSession = name => {
  let value = sessionStorage[name];
  if (value == null || value === undefined) return null;
  if (value.indexOf("{") >= 0) {
    value = JSON.parse(value);
  }
  return value;
}
export const getHashParameters = () => {
  if (window.location.hash.split('?').length > 1) {
    let arr = window.location.hash.split('?')[1].split('&');
    let params = {}
    for (let i = 0; i < arr.length; i++) {
      let data = arr[i].split('=')
      if (data.length === 2) {
        params[data[0]] = data[1]
      }
    }
    return params
  }
  return null
}

export const getUrlParam=(name) => {
  let params = getHashParameters();
  if(params){
    return params[name]
  }
  return null
}
export const getUrlCode=()=>{
  if( window.location.hash.split('?').length>1){
      let index = window.location.hash.indexOf("?ps=")+4;
      let params = window.location.hash.substr(index);
      return params
    }
    return null
}

//1000*60=1min
export const ticksTime = (ticks, time = 1000 * 60 * 60 * 24) => {
  let a = new Date().getTime() / 1000;
  if (a - ticks <= time / 1000) {
    return true
  }
  return false
}

//输入框限制字节长度
export const byteCheck = (str, maxLen) => {
  let w = 0;
  let tempCount = 0;
  //length 获取字数数，不区分汉子和英文
  for (let i = 0; i < str.length; i++) {
    //charCodeAt()获取字符串中某一个字符的编码
    let c = str.charCodeAt(i);
    //单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      w++;
    } else {
      w += 3;
    }
    if (w > maxLen) {
      return false;
    }
  }
  return true
}

export const isEmpty = (str) => {
  if (str === undefined || str == null || str === "null" || str.length === 0 || str === "undefined")
    return true;
  return false;
}

// Return an empty string if null. Otherwiser original value. Use for wrapping the value in Json returned from WS call
// 2022.04.29
export const emptyForNull = (value) => {
  return isEmpty(value)?"":value;
}

// if value = "Y",  return true. null, or otherwise = "N"
// 2022.04.29
export const falseForNullYN = (value) => {
  return isEmpty(value)?false: (value=="Y");
}

// from a list of json opjects, lookup the first occurance of matched specified attribute, and return another attribute.
// 2022.04.29
export const lookupInList = (lookupAttrName, returnAttrName, lookupValue, jsonList) => {
  // console.log("lookupInList, jsonList-[" + JSON.stringify(jsonList) + "]");
  let rtn = null;
  for(let i=0;i<jsonList.length;i++){
    let thisItem = jsonList[i];
    if (lookupValue===thisItem[lookupAttrName]) {
      rtn = thisItem[returnAttrName];
    }
  }
  // console.log("lookupInList, rtn-[" + rtn + "]");
  return rtn;
}


export const formatInputDate = (value) => {
  let formatValue = "";
  if(!isEmpty(value)){
      let dateValues = value.split("-");
      formatValue = dateValues[2]+"/"+dateValues[1]+"/"+dateValues[0];
  }

  return formatValue
}

export const formatDisplayDate = (value) => {
  let formatValue = "";
  if(!isEmpty(value)){
      let dateValues = value.split("/");
      formatValue = dateValues[2]+"-"+dateValues[1]+"-"+dateValues[0];
  }

  return formatValue
}


export const currencyFormatter = (s) => {
  s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(2) + "";

	var l = s.split(".")[0].split("").reverse();

	var r = s.split(".")[1];

	var t = "";

	for (var i = 0; i < l.length; i++) {

		t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length && l[i+1] != "-" ? "," : "");

	}

	return t.split("").reverse().join("") + "." + r;
  }  


  export const numberFormatter = (s) => {
    if (!s) return '';
    let result = s.replace(/[a-zA-Z]/g, '').replace(/,/g, '');
    return result;
  }  

export const dateConvert = (value) => {
  let formatValue = "";
  if(!isEmpty(value)){
      let dateValues = value.split("/");
      formatValue = dateValues[2]+"/"+dateValues[1]+"/"+dateValues[0];
  }

  return formatValue
}

export const genKey = () => {
  return Math.floor(Math.random() * 1000000) + Math.floor(Math.random() * 1000000) ;
}

export const stringToDate=(valueString, inputFormat)=>
{
			if(valueString == null)
				return null;
			let mask="";
			let temp="";
			let dateString = "";
			let monthString = "";
			let yearString = "";
			let j = 0;

			let n = inputFormat.length;
      let i=0;
			for(i = 0; i < n; i++, j++)
			{
				temp = "" + valueString.charAt(j);
				mask = "" + inputFormat.charAt(i);

				if(mask == "M")
				{
					if(isNaN(Number(temp)) || temp == " ")
						j--;
					else
						monthString += temp;
				}
				else if(mask == "D")
				{
					if(isNaN(Number(temp)) || temp == " ")
						j--;
					else
						dateString += temp;
				}
				else if(mask == "Y")
				{
					yearString += temp;
				}
				else if(!isNaN(Number(temp)) && temp != " ")
				{
					return null;
				}
			}

			temp = "" + valueString.charAt(inputFormat.length - i + j);
			if(!(temp == "") && (temp != " "))
				return null;

			let monthNum = Number(monthString);
			let dayNum = Number(dateString);
			let yearNum = Number(yearString);

			if(isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum))
				return null;

			if(yearString.length == 2 && yearNum < 70)
				yearNum += 2000;

			let newDate = new Date(yearNum, monthNum - 1, dayNum);

			if(dayNum != newDate.getDate() || (monthNum - 1) != newDate.getMonth())
				return null;

			return newDate;
}

export const dateToString=(value, outputFormat)=>
		{
			if(!value)
				return "";

			let date= String(value.getDate());
			if(date.length < 2)
				date = "0" + date;

			let month = String(value.getMonth() + 1);
			if(month.length < 2)
				month = "0" + month;

			let year = String(value.getFullYear());

			let output = "";
			let mask;

			// outputFormat will be null if there are no resources.
			let n = outputFormat != null ? outputFormat.length : 0;
			for(let i = 0; i < n; i++)
			{
				mask = outputFormat.charAt(i);

				if(mask == "M")
				{
					output += month;
					i++;
				}
				else if(mask == "D")
				{
					output += date;
					i++;
				}
				else if(mask == "Y")
				{
					if(outputFormat.charAt(i + 2) == "Y")
					{
						output += year;
						i += 3;
					}
					else
					{
						output += year.substring(2, 4);
						i++;
					}
				}
				else
				{
					output += mask;
				}
			}
			return output;
		}
    export const isDate=(str)=>
    {
      if(isEmpty(str)){
        return false;
      }
      var date = str;
      var result = date.match(/^([0]?[1-9]|[1|2][0-9]|[3][0|1])[/]([0]?[1-9]|[1][0-2])[/]([0-9]{4}|[0-9]{2})$/);
      if (result == null){
          return false;
      }else{
        return true;
      }
      
  }

  //for date checkings; 20190329
export const isTenancyEnded=(tncyEndDtStr)=>{
  {
    let tncyEndDt = stringToDate(tncyEndDtStr, "DD/MM/YYYY");
    let today = stringToDate(dateToString(new Date(), "DD/MM/YYYY"), "DD/MM/YYYY");
    
    if ((tncyEndDt != null && today != null) && (dateCompare(today, tncyEndDt) == 1))
    {
      return true
    }
    
    return false
  }
}

export const  dateCompare=(date1, date2)=>{

  if(Number(date1) < Number(date2))
  {
      return-1
  }
  if(Number(date1) == Number(date2))
  {
      return 0;
  }
  return 1;

}

export const clone=(item)=>{
  if (!item) { return item; } // null, undefined values check

  var types = [ Number, String, Boolean ], 
      result;

  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  types.forEach(function(type) {
      if (item instanceof type) {
          result = type( item );
      }
  });

  if (typeof result == "undefined") {
      if (Object.prototype.toString.call( item ) === "[object Array]") {
          result = [];
          item.forEach(function(child, index, array) { 
              result[index] = clone( child );
          });
      } else if (typeof item == "object") {
          // testing that this is DOM
          if (item.nodeType && typeof item.cloneNode == "function") {
              result = item.cloneNode( true );    
          } else if (!item.prototype) { // check that this is a literal
              if (item instanceof Date) {
                  result = new Date(item);
              } else {
                  // it is an object literal
                  result = {};
                  for (var i in item) {
                      result[i] = clone( item[i] );
                  }
              }
          } else {
              // depending what you would like here,
              // just keep the reference, or create new object
              if (false && item.constructor) {
                  // would not advice to do that, reason? Read below
                  result = new item.constructor();
              } else {
                  result = item;
              }
          }
      } else {
          result = item;
      }
  }

  return result;
}

export const r_n = (text, map) => {
  // Generic ROT-n algorithm for keycodes in MAP.
  var R = "" //new String()
  var i, j, c, len = map.length
  for (i = 0; i < text.length; i++) {
    c = text.charAt(i)
    j = map.indexOf(c)
    if (j >= 0) {
      c = map.charAt((j + len / 2) % len)
    }
    R = R + c
  }
  return R;
}

export const rDecode = (text, time) => {
  // Hides all ASCII-characters from 33 ("!") to 126 ("~").  Hence can be used
  // to obfuscate virtually any text, including URLs and emails.
  var R = "" //new String()
  R = r_n(text,
    "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~")
  return R;
}

export function ROT47(text) {
  var R = new String()
  R = ROTn(text,
  "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~")
  return R;
}
  
export function ROTn(text, map) {
  var R = new String()
  var i, j, c, len = map.length

  for(i = 0; i < text.length; i++) {
    c = text.charAt(i)
    j = map.indexOf(c)

    if (j >= 0) {
      c = map.charAt((j + len / 2) % len)
    }

    R = R + c
  }
  return R;
}

export const getParameters = (str) => {
  let paramsStr = "";
  if (str != null && str !== "") {
    paramsStr = rDecode(str);
  } else { return null }
  let arr = paramsStr.split('&');
  let params = {}
  for (let i = 0; i < arr.length; i++) {
    let data = arr[i].split('=')
    if (data.length === 2) {
      params[data[0]] = data[1]
    }
  }
  return params
}
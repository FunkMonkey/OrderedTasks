var FileIO = {
	
	convertUriToUTF8: function convertUriToUTF8(uri,charSet)
	{
		if(window.netscape == undefined || charSet == undefined || charSet == "")
			return uri;
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
		} catch(ex) {
			return uri;
		}
		return converter.convertURISpecToUTF8(uri,charSet);
	},
	
	getLocalPath: function getLocalPath(origPath)
	{
		var originalPath = this.convertUriToUTF8(origPath, "UTF-8");
		// Remove any location or query part of the URL
		var argPos = originalPath.indexOf("?");
		if(argPos != -1)
			originalPath = originalPath.substr(0,argPos);
		var hashPos = originalPath.indexOf("#");
		if(hashPos != -1)
			originalPath = originalPath.substr(0,hashPos);
		// Convert file://localhost/ to file:///
		if(originalPath.indexOf("file://localhost/") == 0)
			originalPath = "file://" + originalPath.substr(16);
		// Convert to a native file format
		var localPath;
		if(originalPath.charAt(9) == ":") // pc local file
			localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
		else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
			localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
		else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
			localPath = unescape(originalPath.substr(7));
		else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
			localPath = unescape(originalPath.substr(5));
		else // pc network file
			localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
		return localPath;
	},
	
	getFileFromURI: function getFileFromURI(uri)
	{
		if(window.Components) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				var IOService = Components.classes["@mozilla.org/network/io-service;1"].getService().QueryInterface(Components.interfaces.nsIIOService);
				var fph = IOService.getProtocolHandler("file").QueryInterface(Components.interfaces.nsIProtocolHandler);
				
				var fileURI = fph.newURI(uri, null, null);
				var file = fileURI.QueryInterface(Components.interfaces.nsIFileURL).file;
				file.QueryInterface(Components.interfaces.nsIFile);
				return file;
			} catch(ex) {
				return null;
			}
		}
		return null;
	},
	
	
	saveFile: function saveFile(filePath,content)
	{
		if(window.Components) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(filePath);
				if(!file.exists())
					file.create(0,0664);
				var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
				out.init(file,0x20|0x02,00004,null);
				out.write(content,content.length);
				out.flush();
				out.close();
				return true;
			} catch(ex) {
				return false;
			}
		}
		return null;
	}
};
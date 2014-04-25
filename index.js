var path = require("path");
var grunt = require("grunt");
var crypto = require("crypto");
var fs = require("fs");
var static = require('node-static');
var file = new static.Server('./public');

var publicDir = path.join("public", path.sep);
var resourceDir = path.join(publicDir, "resource", path.sep);
var versionsFileName = "resource_version.json";
var versionsFilePath = path.join("public", versionsFileName);

var updateResourceVersions = function(resourceDir, versionsFilePath) {
	var filePathAndHash = {}
	var oldFilePathAndHash = grunt.file.readJSON(versionsFilePath);

	grunt.file.expand({filter: "isFile"}, resourceDir + "**").forEach(function (filename) {
		var filePath = filename.replace(publicDir, "");
		var hash = crypto.createHash("sha1").update(grunt.file.read(filename)).digest("Hex");
		filePathAndHash[filePath] = hash;
		if (oldFilePathAndHash[filePath] != filePathAndHash[filePath]) {
			console.log(filePath + " : " + oldFilePathAndHash[filePath] + " -> " + filePathAndHash[filePath]);
		}
	})
	grunt.file.write(versionsFilePath, JSON.stringify(filePathAndHash));
}

fs.watch(resourceDir, function (event, filename) {
	console.log('update resource versions.');
	updateResourceVersions(resourceDir, versionsFilePath);	
});

//
// Create a node-static server instance to serve the './public' folder
//
require('http').createServer(function (request, response) {
	request.addListener('end', function () {
		file.serve(request, response);
	}).resume();
}).listen(8080);

console.log("Server start at http://localhost:8080");
console.log("versionsFilePath is http://localhost:8080/" + versionsFileName);

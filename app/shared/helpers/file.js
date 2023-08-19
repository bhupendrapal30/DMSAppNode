const config = require('../../../app/config/config');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
//const uuidv4 = require('uuid/v4');
const path = require('path');


/* TO WRITE CSV FILE */
exports.write_csv_file = async function(path, header, data) {
	var status = false;

	const csvWriter = createCsvWriter({
	  path: path,
	  header: header,
	  append: true
	});

	await csvWriter.writeRecords(data).then(()=> status = true);

	return status;
}

/* TO DOWNLOAD ANY FILE */
exports.download_any_file = async function(path, req, res, removeFile = true) {
	
	if(!fs.existsSync(path)) {
    	return false;
    }

	return res.download(path, function(err){
		if(removeFile == true) {
			fs.unlinkSync(path);	
		}
    });
}

/* TO SHOW PDF FILE IN BROSER */
exports.show_pdf_file_browser = async function(path, req, res, removeFile = true) {
	
	if(!fs.existsSync(path)) {
    	return false;
    }

    var data = fs.readFileSync(path);
    res.contentType("application/pdf");
    
    if(removeFile == true) {
    	fs.unlinkSync(path);	
    }

    return res.send(data);
}

// BUCKET DOWNLOAD
exports.download_bucket = async function(key, bucket, req, res){
	var AWS = require('aws-sdk');
	 AWS.config.update(
		 {
			 accessKeyId: config.awsAccessKeyId,
			 secretAccessKey: config.awsSecretAccessKey,
			 region: config.awsRegion
		 }
	 );
	 var s3 = new AWS.S3();
	 var params = {
	   Bucket: bucket,
	   Key: key,
	  };
	 var url =  await s3.getSignedUrl('putObject', params)
	return url.split("?")[0];
}

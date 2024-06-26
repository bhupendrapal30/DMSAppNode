//var models  =  require('../../../../models');
//var User = models.userdetails;
//require("dotenv").config();
var md5 = require('md5');
var jwt = require('jsonwebtoken');
const env = require('../../../config/config');
var apiModel = require(process.cwd() +'/models/api/apiModel');
var masters = require(process.cwd() + '/models/api/masters');
var multer  =   require('multer'); 
//var location = require(process.cwd()+'/upload/');
var moment = require('moment');
//const uuidv4 = require('uuid/v4');
const fs = require('fs');
var pdf = require('html-pdf');
var path = require('path');
var pug = require('pug');
const { response } = require('express');
//var fileHelper = require(process.cwd()+'/app/shared/helpers/file');
//var pdf = require("pdf-creator-node");
//const PDFDocument = require('pdfkit');
var storage =   multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, './uploads');  
  },  
  filename: function (req, file, callback) {  
    callback(null, file.originalname);  
  }  
});  


const downloadPolicy =(pdf)=> {
    
    const pdfLink = pdf;
    const anchorElement = document.createElement('a');

    const fileName = `policy-file.pdf`;
    anchorElement.href = pdfLink;
    anchorElement.download = fileName;

    anchorElement.click();
    
    
  };


module.exports = {
	addUser: async function(req, res) {   
       var mobileNo =req.body.data.mobileNo;  
       let checkId = await masters.check_exist('users', {mobileNo:mobileNo,status:'1'});
       console.log(checkId);
       if(checkId){
       return res.status(422).json({status: false, error: 'Please check the mobile Already exits'}); 
       }
       let insertData = {
        mobileNo : mobileNo,
        fname:req.body.data.fname, 
        lname:req.body.data.lname, 
        email:req.body.data.email, 
        usertype:req.body.data.usertype, 
        password:md5(req.body.data.mobileNo), 
        createdby:req.body.data.createdby, 
        status : 1,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
      var ins = await masters.common_insert('users', insertData);
      if(ins){
        return res.status(200).json({ status: true, message: 'data get successfully', data:insertData,statusCode:200});
      } else {
       res.status(422).json({status: false, error: 'Please check the mobile or password'}); 
      }
    },
    updateUser: async function(req, res) {    
       var mobileNo =req.body.data.mobileNo; 
       var id = req.body.data.id;
      var column = ['id'];
      // var where = {
      //   "mobileNo":mobileNo,
      //   "status":1,
      //   "id":{"$ne":1}
      //  }
      //  var where ="mobileNo="+mobileNo+ " and status=1";
      //  let checkId_user = await masters.getSingleRecord('users',column,where);
      //  console.log(checkId_user);
      var checkId_user = [];
      await knex.select('id').from('users')
        .whereRaw("mobileNo = "+mobileNo+" and id != "+id+" and status=1 and deletestatus=0")
        .then((result) => {
          checkId_user = result.length > 0 ? result[0] : false;
        }, (error) => {console.log(error);});
       if(checkId_user){
       return res.status(422).json({status: false, error: 'Please check the mobile Already exits'}); 
       }
       let updateData = {
        mobileNo : mobileNo,
        fname:req.body.data.fname, 
        lname:req.body.data.lname, 
        email:req.body.data.email, 
        usertype:req.body.data.usertype, 
        password:md5(req.body.data.password), 
        updatedby:req.body.data.updatedby, 
        status : 1
      }
      let checkId = await masters.check_exist('users', {id:id});
      if(checkId){
          let update = await masters.common_update('users', updateData, {id:id});
          if(update){
            return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
          } else {
            return res.status(400).json({ status: false, message: 'data not updated'});
          }
      }else{
        return res.status(400).json({ status: false, message: 'User details not found'});
      }
    },
    logout : async function(req, res) {
    },
    userlist: async function(req,res){
      var joins = [
        {
            table: 'roles as roles',
            condition: ['users.usertype', '=', 'roles.id'],
            jointype: 'LEFT'
        }
    ];
    var orderby = 'users.createddate DESC';
    var where = {'users.status':1};
    var extra_whr = '';
    var limit_arr = '';
    var columns = ['users.id', 'users.fname','users.lname','users.email','users.mobileNo','users.usertype','users.status','users.createddate','roles.name as usertypename'];
    var limit_arr = { 'limit': 10, 'offset': 1 };
    var result = await apiModel.get_joins_records('users', columns, joins, where, orderby, extra_whr, limit_arr);
    return res.status(200).json({ status: true, message: 'User List fetched successfully', data: result, statusCode: 200});

    },
    rolelist:async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      where['deletestatus'] = 0;
      var orderby = 'createddate DESC';
      var columns = ['id','name','status'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'roles', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: 'Role list fetched successfully', data: response});

    },
    fileUpload:async function(req,res){
       console.log(req.body.data);
      var filename = req.body.data.filename;
      var title = req.body.data.title;
      var version = req.body.data.file_version;
      var location = "test";
      let insertData = {
      filename : filename,
      title:title,
      policyType:req.body.data.policyType,
      location:location, 
      description:req.body.data.description,
      file_version: version, 
      category_id:req.body.data.category_id, 
      standard_id:req.body.data.standard_id,
      status : req.body.data.status,
      createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }
    var ins = await masters.common_insert('default_files', insertData);
    if(ins){
      return res.status(200).json({ status: true, message: 'data added successfully', data:insertData,statusCode:200});
    } else {
      return res.status(400).json({ status: false, message: 'data not updated'});
    }
     
    
    },
    fileupdate:async function(req,res,next){
       var id=req.body.data.id===undefined ? 1 : req.body.data.id;
       
       var location = "test";
       var filename = req.body.data.filename;
       var filename = req.body.data.policyType;
       var title = req.body.data.title;
       var version = req.body.data.file_version;
       var location = "test";
       var column = ['id','filename','title','location', 'description','category_id','standard_id','file_version'];
    let checkId = await masters.getSingleRecord('default_files',column, {id:id});
     
      if(checkId){
        let updateData = {
        filename : filename,
        title:title,
        location:location,
        policyType:req.body.data.policyType, 
        file_version:version,  
        description:req.body.data.description, 
        category_id:req.body.data.category_id, 
        standard_id:req.body.data.standard_id,
        status : req.body.data.status,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
        console.log(checkId);
        let update = await masters.common_update('default_files', updateData, {id:id});
         if(update){
          let insertData_version = {
            default_id : checkId.id,
            filename:checkId.filename, 
            location:checkId.location,
            description:checkId.description, 
            category_id:checkId.category_id,
            standard_id : checkId.standard_id,
            title:checkId.title,
            pdflink:checkId.pdflink,
            status : req.body.status,
            createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          }
          var ins_version = await masters.common_insert('default_files_version', insertData_version);
           return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
         } else {
           return res.status(400).json({ status: false, message: 'data not updated'});
         }
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
     
    },
    // defaultfilelist: async function(req,res){
    //   var finalData = {};
    //   var where = {};
    //   where['status'] = '1';
    //   var orderby = 'id DESC';
    //   var columns = ['id','category_id','pdflink','title','filename','location','description','status','file_version'];
    //   var response = await masters.get_definecol_bytbl_cond_sorting(columns,'default_files', where, orderby );
    //   finalData.data = response; 
    //   return res.status(200).json({status: true, message: ' list fetched successfully', data: finalData});
    // },

    defaultfilelist: async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      var orderby = 'createddate DESC';
      var columns = ['id','category_id','pdflink','title','filename','location','description','status','file_version'];
     // var response = await masters.get_definecol_bytbl_cond_sorting(columns,'default_files', where, orderby );
     // finalData.data = response; 
     // return res.status(200).json({status: true, message: ' list fetched successfully', data: finalData});
      var joins = [
        {
            table: 'policycategory as policycategory',
            condition: ['default_files.category_id', '=', 'policycategory.id'],
            jointype: 'LEFT'
        },
        {
          table: 'standard',
          condition: ['default_files.standard_id', '=', 'standard.id'],
          jointype: 'LEFT'
      }
    ];
    var orderby = 'default_files.createddate DESC';
    var where = {'default_files.status':1};
    var extra_whr = '';
    var limit_arr = '';
    var columns = ['default_files.id','default_files.pdflink','default_files.title','default_files.file_version','default_files.category_id','default_files.filename','default_files.location','default_files.description','default_files.status','policycategory.name as categoryname','standard.name as standardname'];
    //    var limit_arr = { 'limit': 10, 'offset': 1 };
    var result = await apiModel.get_joins_records('default_files', columns, joins, where, orderby, extra_whr, limit_arr);
    
    return res.status(200).json({ status: true, message: 'Permisssion List fetched successfully', data: result, statusCode: 200});

   
   
    },
    addrole: async function(req,res){
      let checkId = await masters.check_exist('roles', {name:req.body.data.name,status:'1'});
       if(checkId){
       return res.status(422).json({status: false, error: 'Role name Already exits'}); 
       }
      let insertData = {
        name : req.body.data.name,
        createdby:req.body.data.createdby, 
        status : req.body.data.status,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
      var ins = await masters.common_insert('roles', insertData);
      if(ins){
        return res.status(200).json({ status: true, message: 'data insert successfully', data:insertData,statusCode:200});
      } else {
       res.status(422).json({status: false, error: 'Please try Again'}); 
      }
    },
    updaterole: async function(req,res){
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var name = req.body.data.name===undefined ? NULL : req.body.data.name;
      var checkId_id = [];
      await knex.select('id').from('roles')
        .whereRaw("name = '"+name+"' and id != "+id+" and status=1 and deletestatus=0")
        .then((result) => {
          checkId_id = result.length > 0 ? result[0] : false;
        }, (error) => {console.log(error);});
       if(checkId_id){
       return res.status(422).json({status: false, error: 'Please check the Role Already exits'}); 
       }
        var column = ['name', 'updatedby', 'status'];
      let checkId = await masters.getSingleRecord('roles',column, {id:id});
        if(checkId){
          let updateData = {
          name : req.body.data.name===undefined ? checkId.name : req.body.data.name,
          updatedby:req.body.data.updatedby===undefined ? checkId.updatedby : req.body.data.updatedby, 
          status : req.body.data.status===undefined ? checkId.status : req.body.data.status,
          createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
            let update = await masters.common_update('roles', updateData, {id:id});
            if(update){
              return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
            } else {
              return res.status(400).json({ status: false, message: 'data not updated'});
            }
        }else{
          return res.status(400).json({ status: false, message: ' details not found'});
        }

    },
    deleteuser:async function(req,res){
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var updatedby = req.body.data.updatedby ? NULL : req.body.data.updatedby;
      var column = ['id'];
      let checkId = await masters.getSingleRecord('users',column, {id:id});
      if(checkId){
        var where = {id:id};
        var updatedate= {
          status:0,
          deletestatus:1,
          updateby:updatedby
        }
        delete_status = await masters.common_update('users',updatedate,where)
        if(delete_status){
          return res.status(200).json({ status: true, message: 'data get successfully', data:delete_status,statusCode:200});
        } else {
          return res.status(400).json({ status: false, message: 'data not updated'});
        }
      } else {
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    
    },
    deleterole:async function(req,res){
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var updatedby = req.body.data.updatedby ? NULL : req.body.data.updatedby;
      var column = ['id'];
      let checkId = await masters.getSingleRecord('roles',column, {id:id});
      if(checkId){
        var where = {id:id};
        var updatedate= {
          status:0,
          deletestatus:1,
          updateby:updatedby
        }
        delete_status = await masters.common_update('roles',updatedate,where)
        if(delete_status){
          return res.status(200).json({ status: true, message: 'data get successfully', data:delete_status,statusCode:200});
        } else {
          return res.status(400).json({ status: false, message: 'data not updated'});
        }
      } else {
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    
    },
    getuserbyId:async function(req,res){
      
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var column = ['id','fname','lname','mobileNo','email','company_name','usertype','password','status','deletestatus','createdby','createddate','upadtedby','updateddate'];
      let checkId = await masters.getSingleRecord('users',column, {id:id});
        if(checkId){
              return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
        }else{
          return res.status(400).json({ status: false, message: ' details not found'});
        }
    },
    getrolebyId:async function(req,res){
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var column = ['id','name','createdby','createddate','updatedby','upadteddata','status','deletestatus'];
      let checkId = await masters.getSingleRecord('roles',column, {id:id});
        if(checkId){
              return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
        }else{
          return res.status(400).json({ status: false, message: ' details not found'});
        }
      },
      modulelist: async function(req,res){
        var finalData = {};
        var where = {};
        where['status'] = '1';
        var orderby = 'createddate DESC';
        var columns = ['id as value','name as label'];
        var response = await masters.get_definecol_bytbl_cond_sorting(columns,'modules', where, orderby );
        finalData.data = response; 
        console.log(response)
        return res.status(200).json({status: true, message: ' list fetched successfully', data:finalData,statusCode:200});
      },
      rolelistingdata: async function(req,res){
        var finalData = {};
        var where = {};
        where['status'] = '1';
        var orderby = 'createddate DESC';
        var columns = ['id as value','name as label'];
        var response = await masters.get_definecol_bytbl_cond_sorting(columns,'roles', where, orderby );
        finalData.data = response; 
        console.log(response)
        return res.status(200).json({status: true, message: ' list fetched successfully', data:finalData,statusCode:200});
      },
      addpermission: async function(req,res){
        var roleid = req.body.data.roleid; 
        var moduleid = req.body.data.moduleid;
        var addedit = req.body.data.addedit == true ?1:0;
        var view = req.body.data.view==true?1:0;
        var deleteflag = req.body.data.deleteflag;
        let checkId = await masters.check_exist('permission', {roleid:roleid,moduleid:moduleid,status:'1',deletestatus:0});
         if(checkId){
         return res.status(422).json({status: false, error: 'Permission Already exits'}); 
         }
        let insertData = {
          roleid:roleid,
          moduleid:moduleid,
          addedit:addedit,
          view:view,
          deleteflag:deleteflag,
          createdby : req.body.data.createdby,
          createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
        var ins = await masters.common_insert('permission', insertData);
        if(ins){
          return res.status(200).json({ status: true, message: 'data insert successfully', data:insertData,statusCode:200});
        } else {
         res.status(422).json({status: false, error: 'Please try Again'}); 
        }
      },
      updatepermission: async function(req,res){
        var id=req.body.data.id===undefined ? NULL : req.body.data.id;
        var roleid = req.body.data.roleid;
        var moduleid = req.body.data.moduleid;
        var addedit = req.body.data.addedit;
        var view = req.body.data.view;
        var deleteflag = req.body.data.deleteflag;
        var checkId_id = [];
        await knex.select('id').from('permission')
          .whereRaw("roleid = '"+roleid+"' and moduleid = '"+moduleid+"' and id != "+id+" and status=1 and deletestatus=0")
          .then((result) => {
            checkId_id = result.length > 0 ? result[0] : false;
          }, (error) => {console.log(error);});
         if(checkId_id){
         return res.status(422).json({status: false, error: 'Please check the Role Already exits'}); 
         }
          var column = ['roleid', 'moduleid', 'addedit','view', 'deleteflag', 'updatedby','status'];
        let checkId = await masters.getSingleRecord('permission',column, {id:id});
          if(checkId){
            let updateData = {
              roleid : roleid===undefined ? checkId.roleid : roleid,
              moduleid:moduleid===undefined ? checkId.moduleid : moduleid, 
              addedit : addedit===undefined ? checkId.addedit : addedit,
              view : view===undefined ? checkId.view : view,
              deleteflag : deleteflag===undefined ? checkId.deleteflag : deleteflag,
              updatedby : req.body.data.updatedby===undefined ? checkId.updatedby : req.body.data.updatedby,
              status : req.body.data.status===undefined ? checkId.status : req.body.data.status
           
          }
              let update = await masters.common_update('permission', updateData, {id:id});
              if(update){
                return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
              } else {
                return res.status(400).json({ status: false, message: 'data not updated'});
              }
          }else{
            return res.status(400).json({ status: false, message: ' details not found'});
          }
  
      },
      permissionlist: async function(req,res){
        var joins = [
          {
              table: 'roles as roles',
              condition: ['permission.roleid', '=', 'roles.id'],
              jointype: 'LEFT'
          },
          {
            table: 'modules',
            condition: ['permission.moduleid', '=', 'modules.id'],
            jointype: 'LEFT'
        }
      ];
      var orderby = 'permission.createddate DESC';
      var where = {'permission.status':1};
      var extra_whr = '';
      var limit_arr = '';
      var columns = ['permission.id','permission.roleid','permission.moduleid','permission.addedit','permission.view','permission.deleteflag','permission.status','roles.name as rolename','modules.name as modulesname'];
      var limit_arr = { 'limit': 10, 'offset': 1 };
      var result = await apiModel.get_joins_records('permission', columns, joins, where, orderby, extra_whr, limit_arr);
      
      return res.status(200).json({ status: true, message: 'Permisssion List fetched successfully', data: result, statusCode: 200});
  
      },
      deletepermission:async function(req,res){
        var id=req.body.data.id===undefined ? NULL : req.body.data.id;
        var updatedby = req.body.data.updatedby ? NULL : req.body.data.updatedby;
        var column = ['id'];
        let checkId = await masters.getSingleRecord('permission',column, {id:id});
        if(checkId){
          var where = {id:id};
          var updatedate= {
            status:0,
            deletestatus:1,
            updateby:updatedby
          }
          delete_status = await masters.common_update('permission',updatedate,where)
          if(delete_status){
            return res.status(200).json({ status: true, message: 'data updated successfully', data:delete_status,statusCode:200});
          } else {
            return res.status(400).json({ status: false, message: 'data not updated'});
          }
        } else {
          return res.status(400).json({ status: false, message: ' details not found'});
        }
      },
      getpermissionId:async function(req,res){
        var id=req.body.data.id===undefined ? NULL : req.body.data.id;
        var column = ['id','roleid','moduleid','addedit','view','deleteflag','status'];
        let checkId = await masters.getSingleRecord('permission',column, {id:id});
          if(checkId){
                return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
          }else{
            return res.status(400).json({ status: false, message: ' details not found'});
          }
      },

      getPolicyId:async function(req,res){
        var id=req.body.data.id===undefined ? NULL : req.body.data.id;
        var column = ['*'];
        let checkId = await masters.getSingleRecord('default_files',column, {id:id});
          if(checkId){
                return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
          }else{
            return res.status(400).json({ status: false, message: ' details not found'});
          }
      },

        downloadpdf:async function(req,res){
        var final_data = {};
        var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      const baseUrl = __appBaseUrl;
      var column = ['*'];
      let checkId = await masters.getSingleRecord('default_files',column, {id:id});
      var column_company = ['companyname','logo'];
      let company_details = await masters.getSingleRecord('setting',column_company, {id:1});
      var logo =  __appBaseUrl+'api/user/downloadPdfFile/'+company_details.logo;
      console.log(checkId.filename);
      var file_name = checkId.filename;
      if(file_name==null || file_name==''){
      var fileName = Date.now()+".pdf"
    // var fileName= 'test.pdf';
      const pdfPath = __uploadDir+'/reports/pdf/'+fileName;
      //const pdfPath = fileName;

      //console.log(pdfPath);
      const rootPath = path.resolve("./");
      const htmlData = pug.renderFile(rootPath+'/app/views/pdfview.pug', {
        baseUrl: baseUrl,
        data: checkId,
        companyname:company_details.companyname,
        logo:logo
      });

      var html = htmlData;
      var options = { format: 'A4', orientation: "portrait" };  
   
      let updateData = {
        filename : fileName,
        updatedby:req.body.data.updatedby, 
       // status : req.body.data.status===undefined ? checkId.status : req.body.data.status,
       updateddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
       //   let update = await masters.common_update('default_files', updateData, {id:id}); 
      pdf.create(html, options).toFile(pdfPath, function(err, response) {
       // final_data = '';
        if (err) return console.log(err);
        const downloadLink = __appBaseUrl+'api/user/downloadPdfFile/'+fileName;
        final_data.url = downloadLink;
        update =  masters.common_update('default_files', {"pdflink":downloadLink}, {id:id});
        return res.status(200).json({status: true, message: 'download link received successfully', data: final_data});
      });
    } else {
      
      const downloadLink = __appBaseUrl+'api/user/downloadPdfFile/'+file_name;
      final_data.url = downloadLink;
         update =  masters.common_update('default_files', {"pdflink":downloadLink}, {id:id});
      return res.status(200).json({status: true, message: 'download link received successfully', data: final_data});
    }
      },
//       downloadpdf:async function(req,res){
//         var id=req.body.data.id===undefined ? NULL : req.body.data.id;
//         let pdfDoc = new PDFDocument;
//          var column = ['id','description'];
//      let checkId = await masters.getSingleRecord('default_files',column, {id:id});
//      var description = checkId.description;
//       const fileName = Date.now()+".pdf"
//       const pdfPath = __uploadDir+'/reports/pdf/'+fileName;
//        pdfDoc.pipe(fs.createWriteStream(pdfPath));           
// pdfDoc.text("My Sample PDF Document");
// pdfDoc.text(description);
// pdfDoc.end();
// return res.status(200).send('Error: no such file or directory')
//       },
      downloadPdfFile: async function(req, res) {
       var fileName = req.params.filename;
      const filePath = __uploadDir+'/reports/pdf/'+fileName;
       res.sendFile(filePath);
    },
    categorylist:async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      var orderby = 'createddate DESC';
      var columns = ['id as value','name as label'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'policycategory', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: 'Category list fetched successfully', data: response});

    },
    standredlist:async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      var orderby = 'createddate DESC';
      var columns = ['id as value','name as label'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'standard', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: 'Standared list fetched successfully', data: response});

    },

    defaultfilelist_version:async function(req,res){
      
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var finalData = {};
      var where = {};
      var orderby = 'createddate DESC';
      var columns = ['id','category_id','pdflink','title','filename','location','description','status','file_version'];
     var joins = [
        {
            table: 'policycategory as policycategory',
            condition: ['default_files.standard_id', '=', 'policycategory.id'],
            jointype: 'LEFT'
        },
        {
          table: 'standard',
          condition: ['default_files.category_id', '=', 'standard.id'],
          jointype: 'LEFT'
      }
    ];
    var orderby = 'default_files.createddate DESC';
    var where = {'default_files.status':1,'default_id':id};
    var extra_whr = '';
    var limit_arr = '';
    var columns = ['default_files.id','default_files.pdflink','default_files.title','default_files.category_id','default_files.filename','default_files.location','default_files.description','default_files.status','policycategory.name as categoryname','standard.name as standardname'];
    //    var limit_arr = { 'limit': 10, 'offset': 1 };
    var response = await apiModel.get_joins_records('default_files_version as default_files', columns, joins, where, orderby, extra_whr, limit_arr);
    
      return res.status(200).json({status: true, message: 'list fetched successfully', data: response});

    },
    clauselist:async function(req,res){
      var finalData = {};

      var frameworkid=req.body.data.frameworkid===undefined ? NULL : req.body.data.frameworkid;      var where = {};
      where['status'] = '1';
      where['frameworkid'] = frameworkid;
      var orderby = 'id ASC';
      var columns = ['id as value','clause as label'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'clause', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: 'Clause list fetched successfully', data: response});

    },
    subclauselist:async function(req,res){
      var finalData = {};
      var clause_id=req.body.data.clause_id===undefined ? NULL : req.body.data.clause_id;
      var where = {};
      where['status'] = '1';
      where['clause_id'] = clause_id;
      var orderby = 'id ASC';
      var columns = ['id','sabclause as name'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'sub_clause', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: 'Sub Clause list fetched successfully', data: response});

    },
    defaultfilelist:async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      var orderby = 'id DESC';
      var columns = ['id', 'Standard', 'Clause', 'Subclause', 'ControlTitle', 'ControlsDescription', 'Control_Applicability', 'Exclusion_Justification', 'Remarks', 'version', 'Creator', 'createdon', 'approver', 'approvedon', 'Enable', 'Artifacttype', 'ArtifactName', 'Domain', 'weightage', 'code', 'status'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'default_files_list', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: ' list fetched successfully', data: response});

    },
    assigner:async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      where['assignerflag'] = '1';
      var orderby = 'id DESC';

      var columns = ['id as value','fname as label'];

      let checkId = await masters.get_definecol_bytbl_cond_sorting(columns,'users', where, orderby );
      if(checkId){
            return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    },
    owner:async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      where['ownerflag'] = '1';
      var orderby = 'id DESC';

      var columns = ['id as value','fname as label'];

      let checkId = await masters.get_definecol_bytbl_cond_sorting(columns,'users', where, orderby );
      if(checkId){
            return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    },
    department:async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      var orderby = 'id DESC';

      var columns = ['id as value ','departmentname as label'];

      let checkId = await masters.get_definecol_bytbl_cond_sorting(columns,'Department', where, orderby );
      if(checkId){
            return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    },

    reccurence: async function reccurence(req,res){

      var finalData = {};
      var where = {};
      where['status'] = '1';
      var orderby = 'id DESC';

      var columns = ['id as value','name as label'];

      let checkId = await masters.get_definecol_bytbl_cond_sorting(columns,'reccurence', where, orderby );
      if(checkId){
            return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    },
    createpolicy: async function createpolicy(req,res){
     // console.log(req.body);
      let insertData = {
        policyname:req.body.data.policyname, 
        primaryassignee:req.body.data.primaryassignee, 
        reccurenceid:req.body.data.reccurenceid, 
        departmentsid:req.body.data.departmentsid, 
        policyrequirements:req.body.data.policyrequirements, 
        createdby:req.body.data.createdby, 
        status : 1,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
      var ins = await masters.common_insert('policy', insertData);
      if(ins){
 insertData.policyid =ins;

        return res.status(200).json({ status: true, message: 'data get successfully', data:insertData,insertId:ins,statusCode:200});
      } else {
       res.status(422).json({status: false, error: 'Please check the mobile or password'}); 
      }
    },

    getPolicyById:async function(req,res){
        var id=req.body.data.id===undefined ? NULL : req.body.data.id;
        var column = ['*'];
        let checkId = await masters.getSingleRecord('policy',column, {id:id});
          if(checkId){
                return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
          }else{
            return res.status(400).json({ status: false, message: ' details not found'});
          }
      },

      frameworklist: async function frameworklist(req,res){

      var finalData = {};
      var where = {};
      where['status'] = '1';
      var orderby = 'id DESC';

      var columns = ['id as value','name as label'];

      let checkId = await masters.get_definecol_bytbl_cond_sorting(columns,'framework', where, orderby );
      if(checkId){
            return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    },
    controlist: async function controlist(req,res){
      var finalData = {};
      var frameworkid=req.body.data.frameworkid===undefined ? NULL : req.body.data.frameworkid;

      var where = {};
      where['status'] = '1';
      where['frameworkid'] = frameworkid;
      var orderby = 'id DESC';

      var columns = ['id as value','name as label'];

      let checkId = await masters.get_definecol_bytbl_cond_sorting(columns,'control', where, orderby );
      if(checkId){
            return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    },
    subcontrolist: async function subcontrolist(req,res){
      var finalData = {};
      var control_id=req.body.data.control_id===undefined ? NULL : req.body.data.control_id;

      var where = {};
      where['status'] = '1';
      where['control_id'] = control_id;
      var orderby = 'id DESC';

      var columns = ['id as value','name as label'];

      let checkId = await masters.get_definecol_bytbl_cond_sorting(columns,'subcontrol', where, orderby );
      if(checkId){
            return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
    },

  clauselist:async function(req,res){
      var finalData = {};

      var frameworkid=req.body.data.frameworkid===undefined ? NULL : req.body.data.frameworkid;      
      var where = {};
      where['status'] = '1';
      where['frameworkid'] = frameworkid;
      var orderby = 'id ASC';
      var columns = ['id as value','clause as label'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'clause', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: 'Clause list fetched successfully', data: response});

    },
    subclauselist:async function(req,res){
      var finalData = {};
      var clause_id=req.body.data.clause_id===undefined ? NULL : req.body.data.clause_id;
      var where = {};
      where['status'] = '1';
      where['clause_id'] = clause_id;
      var orderby = 'id ASC';
      var columns = ['id as value','sabclause as label'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'sub_clause', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: 'Sub Clause list fetched successfully', data: response});

    },

    cratepolicyowner: async function(req,res){
      var policyid=req.body.data.policyid===undefined ? NULL : req.body.data.policyid;
      var ownerid = req.body.data.ownerid===undefined ? NULL : req.body.data.ownerid;
      var checkId_id = [];
      await knex.select('id').from('policy_owner_mapping')
        .whereRaw("policyid = '"+policyid+"' and ownerid= "+ownerid+" and status=1")
        .then((result) => {
          checkId_id = result.length > 0 ? result[0] : false;
        }, (error) => {console.log(error);});
       if(checkId_id){
       return res.status(422).json({status: false, error: 'Please check details Already exits'}); 
       }
           let updateData = {
          policyid : policyid,
          ownerid:ownerid, 
          status : req.body.data.status===undefined ? checkId.status : req.body.data.status,
          createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
            let update = await masters.common_insert('policy_owner_mapping', updateData);
            if(update){
              return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,insertid:update,statusCode:200});
            } else {
              return res.status(400).json({ status: false, message: 'data not updated'});
            }

    },
    cratepolicyapprover: async function(req,res){
      var policyid=req.body.data.policyid===undefined ? NULL : req.body.data.policyid;
      var approverid = req.body.data.approverid===undefined ? NULL : req.body.data.approverid;
  //    var approver_id = req.body.data.approver_id===undefined ? NULL : req.body.data.approver_id;

      // var checkId_id = [];
      // await knex.select('id').from('policy_approver_mapping')
      //   .whereRaw("policyid = '"+policyid+"' and approverid= "+approverid+" and status=1")
      //   .then((result) => {
      //     checkId_id = result.length > 0 ? result[0] : false;
      //   }, (error) => {console.log(error);});
      //  if(checkId_id){
      //  return res.status(422).json({status: false, error: 'Please check details Already exits'}); 
      //  }

           let updateData = {
          policyid : policyid,
          approverid:approverid, 
          status : req.body.data.status===undefined ? checkId.status : req.body.data.status,
          createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
            let update = await masters.common_insert('policy_approver_mapping', updateData);
            if(update){
              return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,insertid:update,statusCode:200});
            } else {
              return res.status(400).json({ status: false, message: 'data not updated'});
            }

    },
    policycontralmapping: async function(req,res){
      var policyid=req.body.data.policyid===undefined ? NULL : req.body.data.policyid;
      var approverid = req.body.data.approverid===undefined ? NULL : req.body.data.approverid;
      var checkId_id = [];
      await knex.select('id').from('policy_approver_mapping')
        .whereRaw("policyid = '"+policyid+"' and approverid= "+approverid+" and status=1")
        .then((result) => {
          checkId_id = result.length > 0 ? result[0] : false;
        }, (error) => {console.log(error);});
       if(checkId_id){
       return res.status(422).json({status: false, error: 'Please check details Already exits'}); 
       }
           let updateData = {
          policyid : policyid,
          approverid:approverid, 
          status : req.body.data.status===undefined ? checkId.status : req.body.data.status,
          createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
            let update = await masters.common_insert('policy_approver_mapping', updateData);
            if(update){
              return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,insertid:update,statusCode:200});
            } else {
              return res.status(400).json({ status: false, message: 'data not updated'});
            }

    },
    policyupdate: async function(req,res){
      var policyid=req.body.data.policyid===undefined ? NULL : req.body.data.policyid;
      var approverid = req.body.data.approverid===undefined ? NULL : req.body.data.approverid;
      var ownerid = req.body.data.ownerid===undefined ? NULL : req.body.data.ownerid;
      var policyname = req.body.data.policyname===undefined ? NULL : req.body.data.policyname;
      var primaryassignee = req.body.data.primaryassignee===undefined ? NULL : req.body.data.primaryassignee;
      var reccurenceid = req.body.data.reccurenceid===undefined ? NULL : req.body.data.reccurenceid;
      var departmentsid = req.body.data.departmentsid===undefined ? NULL : req.body.data.departmentsid;
      var ownerid = req.body.data.ownerid===undefined ? NULL : req.body.data.ownerid;
      var policyrequirements = req.body.data.policyrequirements===undefined ? NULL : req.body.data.policyrequirements;
      var updatedby = req.body.data.updatedby===undefined ? NULL : req.body.data.updatedby;
      var cluse = req.body.data.cluse===undefined ? NULL : req.body.data.cluse;
      var control = req.body.data.control===undefined ? NULL : req.body.data.control;
      var frameworkid = req.body.data.frameworkid===undefined ? NULL : req.body.data.frameworkid;
      const delapmwhereData = {};
      delapmwhereData['policyid'] = policyid;
       await masters.common_delete('policy_approver_mapping', delapmwhereData);
        approverid.forEach((element, index) =>  {
        //console.log(`Current index: ${index}`);
        approverid = element;
        let updateData = {
          policyid : policyid,
          approverid:approverid, 
          status : 1,
          createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
            let update =  masters.common_insert('policy_approver_mapping', updateData);
       // console.log(element);
    });
    let delowmwhereData = {}
    delowmwhereData['policyid'] = policyid;
    await masters.common_delete('policy_owner_mapping', delowmwhereData);
    ownerid.forEach((element, index) =>  {
     //console.log(`Current index: ${index}`);
     owner_id = element;
     let updateData = {
       policyid : policyid,
       ownerid:owner_id, 
       status : 1,
       createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
     }
         let update =  masters.common_insert('policy_owner_mapping', updateData);
    // console.log(element);
 });

 let delclusewhereData = {}
 delclusewhereData['policyid'] = policyid;
    await masters.common_delete('policycluse_mapping', delclusewhereData);
    cluse.forEach((element, index) =>  {
     //console.log(`Current index: ${index}`);
     let clauseid = element.clauseid;
     let subclauseid = element.subclauseid;
     let updateData = {
       policyid : policyid,
       clauseid:clauseid,
       subclauseid:subclauseid,
       status : 1,
       createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
     }
         let update =  masters.common_insert('policycluse_mapping', updateData);
    // console.log(element);
 });
 let delcontrolwhereData = {}
 delcontrolwhereData['policyid'] = policyid;
    await masters.common_delete('policycontral_mapping', delcontrolwhereData);
    control.forEach((element, index) =>  {
     //console.log(`Current index: ${index}`);
     let subcontrolid = element.subcontrolid;
     let controlid = element.controlid;
     let updateData = {
       policyid : policyid,
       subcontrolid:subcontrolid,
       controlid:controlid,
       status : 1,
       createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
     }
         let update =  masters.common_insert('policycontral_mapping', updateData);
    // console.log(element);
 });
 let updateData = {
  id : policyid,
  policyname:policyname, 
  status : 1,
  primaryassignee:primaryassignee,
  reccurenceid:reccurenceid,
  departmentsid:departmentsid,
  policyrequirements:policyrequirements,
  updateddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  updatedby:updatedby,
  frameworkid:frameworkid
}
    let update =  masters.common_update('policy', updateData,{id:policyid});
    if(update){
      return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,insertid:update,statusCode:200});
    } else {
      return res.status(400).json({ status: false, message: 'data not updated'});
    }
    

    },
    policyfileupdate:async function(req,res,next){
      var docs = req.file;
      var filename = docs.filename;
      var location = docs.path;
      var policyType = req.body.policyType;
      var file_version = req.body.file_version;
      var description = req.body.description;
      var optional_description = req.body.optional_description;
      var policyid = req.body.policyid;
     var column = ['id','file_version'];
   let checkId = await masters.getSingleRecord('policy',column, {id:policyid}); 
     if(checkId){
       let updateData = {
        policyType : policyType,
        file_version:file_version,
        description:description, 
        optional_description:optional_description,
        filename:filename,
        location:location

     }
       let update = await masters.common_update('policy', updateData, {id:policyid});
        if(update){
        //  let insertData_version = {
        //    default_id : checkId.id,
        //    filename:checkId.filename, 
        //    location:checkId.location,
        //    description:checkId.description, 
        //    category_id:checkId.category_id,
        //    standard_id : checkId.standard_id,
        //    title:checkId.title,
        //    pdflink:checkId.pdflink,
        //    status : req.body.status,
        //    createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        //  }
        //  var ins_version = await masters.common_insert('default_files_version', insertData_version);
          
         return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
        } else {
          return res.status(400).json({ status: false, message: 'data not updated'});
        }
    }else{
       return res.status(400).json({ status: false, message: ' details not found'});
  } 
   },
   policylist: async function(req,res){
    var finalData = {};
    var where = {};
    where['status'] = '1';
    var orderby = 'createddate DESC';
    var columns = ['policy.id', 'policy.frameworkid', 'policy.policyname', 'policy.primaryassignee', 'policy.reccurenceid', 'policy.departmentsid', 'policy.policyrequirements', 'policy.status', 'policy.file_version', 'policy.filename', 'policy.location', 'policy.pdflink', 'policy.description', 'policy.optional_description', 'policy.policyType','framework.name as frameworkname','users.fname as primaryassignefname','users.lname as primaryassignelname','reccurence.name as reccurencename','Department.departmentname as Departmentname'];
   // var response = await masters.get_definecol_bytbl_cond_sorting(columns,'default_files', where, orderby );
   // finalData.data = response; 
   // return res.status(200).json({status: true, message: ' list fetched successfully', data: finalData});
    var joins = [
      {
          table: 'framework as framework',
          condition: ['policy.frameworkid', '=', 'framework.id'],
          jointype: 'LEFT'
      },
      {
        table: 'users',
        condition: ['policy.primaryassignee', '=', 'users.id'],
        jointype: 'LEFT'
    },
    {
      table: 'reccurence',
      condition: ['policy.reccurenceid', '=', 'reccurence.id'],
      jointype: 'LEFT'
  },
  {
    table: 'Department',
    condition: ['policy.departmentsid', '=', 'Department.id'],
    jointype: 'LEFT'
}
  ];
  var orderby = 'policy.createddate DESC';
  var where = {'policy.status':1};
  var extra_whr = '';
  var limit_arr = '';
  //var columns = ['default_files.id','default_files.pdflink','default_files.title','default_files.file_version','default_files.category_id','default_files.filename','default_files.location','default_files.description','default_files.status','policycategory.name as categoryname','standard.name as standardname'];
  //    var limit_arr = { 'limit': 10, 'offset': 1 };
  var result = await apiModel.get_joins_records('policy', columns, joins, where, orderby, extra_whr, limit_arr);
  var approver_mapping =  apiModel.get_joins_records('policy_approver_mapping', columns, joins, where, orderby, extra_whr, limit_arr);
  return res.status(200).json({ status: true, message: 'Permisssion List fetched successfully', data: result, statusCode: 200});
  },
  
  addtraining: async function(req,res,next){
    var docs = req.file;
    console.log(docs);
    if(docs){
    var trainingfile = docs.filename;
    } else {
      var trainingfile = '';
    }
    var trainingname=req.body.trainingname===undefined ? NULL : req.body.trainingname;
    var description=req.body.description===undefined ? NULL : req.body.description;
    var trainingname=req.body.trainingname===undefined ? NULL : req.body.trainingname;
    var trainingtype=req.body.trainingtype===undefined ? NULL : req.body.trainingtype;
    var trainingURL=req.body.trainingURL===undefined ? NULL : req.body.trainingURL;
    var startdate=req.body.startdate===undefined ? NULL : req.body.startdate;
    var enddate=req.body.enddate===undefined ? NULL : req.body.enddate;
     var quizId=req.body.quizId===undefined ? NULL : req.body.quizId;
    var feedbacksurveyId=req.body.feedbacksurveyId===undefined ? NULL : req.body.feedbacksurveyId;
    // var trainingname=req.body.trainingname===undefined ? NULL : req.body.trainingname;
         let insertData = {
          trainingname : trainingname,
          description:description,
          trainingtype:trainingtype,
          trainingURL:trainingURL,
          trainingfile:trainingfile,
          startdate:startdate,
          enddate:enddate,
          quizId:quizId,
          feedbacksurveyId:feedbacksurveyId,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
          let update = await masters.common_insert('training_management', insertData);
          if(update){
            return res.status(200).json({ status: true, message: 'data get successfully', data:insertData,insertid:update,statusCode:200});
          } else {
            return res.status(400).json({ status: false, message: 'data not updated'});
          }

  },
  traininglist: async function(req,res){
    var finalData = {};
    var where = {};
    where['status'] = '1';
    var orderby = 'createddate DESC';
    var columns = ['trainingname', 'description', 'trainingtype', 'trainingURL', 'trainingfile', 'startdate', 'enddate', 'quizId', 'feedbacksurveyId', 'status','remarks'];
    var response = await masters.get_definecol_bytbl_cond_sorting(columns,'training_management', where, orderby );
    finalData.data = response;
    return res.status(200).json({status: true, message: ' list fetched successfully', data:finalData,statusCode:200});
  },
  traininupdate: async function(req,res){
    var trainingid=req.body.trainingid===undefined ? NULL : req.body.trainingid;
    var docs = req.file;
    console.log(docs);
    if(docs){
    var trainingfile = docs.filename;
    } else {
      var trainingfile = '';
    }
    var trainingname=req.body.trainingname===undefined ? NULL : req.body.trainingname;
    var description=req.body.description===undefined ? NULL : req.body.description;
    var trainingname=req.body.trainingname===undefined ? NULL : req.body.trainingname;
    var trainingtype=req.body.trainingtype===undefined ? NULL : req.body.trainingtype;
    var trainingURL=req.body.trainingURL===undefined ? NULL : req.body.trainingURL;
    var startdate=req.body.startdate===undefined ? NULL : req.body.startdate;
    var enddate=req.body.enddate===undefined ? NULL : req.body.enddate;
     var quizId=req.body.quizId===undefined ? NULL : req.body.quizId;
    var feedbacksurveyId=req.body.feedbacksurveyId===undefined ? NULL : req.body.feedbacksurveyId;
    // var trainingname=req.body.trainingname===undefined ? NULL : req.body.trainingname;
         let updateData = {
          trainingname : trainingname,
          description:description,
          trainingtype:trainingtype,
          trainingURL:trainingURL,
          trainingfile:trainingfile,
          startdate:startdate,
          enddate:enddate,
          quizId:quizId,
          feedbacksurveyId:feedbacksurveyId,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
         }
         var column = ['id'];
    let checkId = await masters.getSingleRecord('training_management',column, {id:trainingid}); 
    if(checkId){
      let update = await masters.common_update('training_management', updateData, {id:trainingid});
       if(update){   
        return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
       } else {
         return res.status(400).json({ status: false, message: 'data not updated'});
       }
   }else{
      return res.status(400).json({ status: false, message: ' details not found'});
 } 
  },
  trainingdetail: async function(req,res){
    var trainingid=req.body.data.trainingid===undefined ? NULL : req.body.data.trainingid;
    var finalData = {};
    var where = {};
    where['status'] = '1';
    where['id']= trainingid;
    var orderby = 'createddate DESC';
    var columns = ['trainingname', 'description', 'trainingtype', 'trainingURL', 'trainingfile', 'startdate', 'enddate', 'quizId', 'feedbacksurveyId', 'status','remarks'];
    var response = await masters.get_definecol_bytbl_cond_sorting(columns,'training_management', where, orderby );
    finalData.data = response;
    return res.status(200).json({status: true, message: 'fetched successfully', data:finalData,statusCode:200});
  },
  policydetails: async function(req,res){
    var policyid=req.body.data.policyid===undefined ? NULL : req.body.data.policyid;
   var finalData = {};
    var where = {};
    where['policy.status'] = '1';
    where['policy.id'] =  policyid
    var orderby = 'createddate DESC';
    var columns = ['policy.id', 'policy.frameworkid', 'policy.policyname', 'policy.primaryassignee', 'policy.reccurenceid', 'policy.departmentsid', 'policy.policyrequirements', 'policy.status', 'policy.file_version', 'policy.filename', 'policy.location', 'policy.pdflink', 'policy.description', 'policy.optional_description', 'policy.policyType','framework.name as frameworkname','users.fname as primaryassignefname','users.lname as primaryassignelname','reccurence.name as reccurencename','Department.departmentname as Departmentname'];
    var joins = [
      {
          table: 'framework as framework',
          condition: ['policy.frameworkid', '=', 'framework.id'],
          jointype: 'LEFT'
      },
      {
        table: 'users',
        condition: ['policy.primaryassignee', '=', 'users.id'],
        jointype: 'LEFT'
    },
    {
      table: 'reccurence',
      condition: ['policy.reccurenceid', '=', 'reccurence.id'],
      jointype: 'LEFT'
  },
  {
    table: 'Department',
    condition: ['policy.departmentsid', '=', 'Department.id'],
    jointype: 'LEFT'
}
  ];
  var orderby = 'policy.createddate DESC';
 // var where = {'policy.status':1,'policy.id:'};
  var extra_whr = '';
  var limit_arr = '';
  //var columns = ['default_files.id','default_files.pdflink','default_files.title','default_files.file_version','default_files.category_id','default_files.filename','default_files.location','default_files.description','default_files.status','policycategory.name as categoryname','standard.name as standardname'];
  //    var limit_arr = { 'limit': 10, 'offset': 1 };
  var result = await apiModel.get_joins_records('policy', columns, joins, where, orderby, extra_whr, limit_arr);
  var joins_apr = [{
    table:'users',
    condition:['policy_approver_mapping.approverid','=','users.id'],
   jointype:'LEFT'
  }]
  var where_apr = {}
  where_apr['policy_approver_mapping.policyid']=policyid;
  where_apr['policy_approver_mapping.status'] =1;
  var columns_apr = ['users.fname','users.lname','policy_approver_mapping.approverid'];
  var orderby_apr = 'policy_approver_mapping.createddate DESC'
  var approver_mapping =  await apiModel.get_joins_records('policy_approver_mapping', columns_apr, joins_apr, where_apr, orderby_apr, extra_whr, limit_arr);
  
  var joins_own = [{
    table:'users',
    condition:['policy_owner_mapping.ownerid','=','users.id'],
   jointype:'LEFT'
  }]
  var where_own = {}
  where_own['policy_owner_mapping.policyid']=policyid;
  where_own['policy_owner_mapping.status'] =1;
  var columns_own = ['users.fname','users.lname','policy_owner_mapping.ownerid'];
  var orderby_own= 'policy_owner_mapping.createddate DESC'
  var owner_mapping =  await apiModel.get_joins_records('policy_owner_mapping', columns_own, joins_own, where_own, orderby_own, '', '');
  
  var joins_clause = [{
    table:'clause',
    condition:['policycluse_mapping.clauseid','=','clause.id'],
   jointype:'LEFT'
  },{
    table:'sub_clause',
    condition:['policycluse_mapping.subclauseid','=','sub_clause.id'],
   jointype:'LEFT'
  }]
  var where_clause = {}
  where_clause['policycluse_mapping.policyid']=policyid;
  where_clause['policycluse_mapping.status'] =1;
  var columns_clause = ['policycluse_mapping.clauseid','policycluse_mapping.subclauseid','clause.clause','sub_clause.sabclause'];
  var orderby_clause= 'policycluse_mapping.createddate DESC'
  var clause_mapping =  await apiModel.get_joins_records('policycluse_mapping', columns_clause, joins_clause, where_clause, orderby_clause, '', '');
  
  var joins_control = [{
    table:'control',
    condition:['policycontral_mapping.controlid','=','control.id'],
   jointype:'LEFT'
  },{
    table:'subcontrol',
    condition:['policycontral_mapping.subcontrolid','=','subcontrol.id'],
   jointype:'LEFT'
  }]
  var where_control = {}
  where_control['policycontral_mapping.policyid']=policyid;
  where_control['policycontral_mapping.status'] =1;
  var columns_control = ['policycontral_mapping.controlid','policycontral_mapping.subcontrolid','control.name as controlname','subcontrol.name as subcontrolname'];
  var orderby_control= 'policycontral_mapping.createddate DESC'
  var control_mapping =  await apiModel.get_joins_records('policycontral_mapping', columns_control, joins_control, where_control, orderby_control, '', '');
  

  return res.status(200).json({ status: true, message: 'fetched successfully', data: result,'approver_mapping':approver_mapping,'owner_mapping':owner_mapping,'cluse_mapping':clause_mapping,'control_mapping':control_mapping, statusCode: 200});
  
},
policyfileupdate:async function(req,res,next){
     
      var filename = req.body.data.filename;

       //var location = docs.path;
      var policyid=req.body.data.policyid===undefined ? 2 : req.body.data.policyid; 
     //  console.log(docs);
       var policyType = req.body.data.policyType;
       var file_version = req.body.data.file_version;
       var description = req.body.data.description;
      // var optional_description = req.body.optional_description;
     var column = ['id','file_version'];
   let checkId = await masters.getSingleRecord('policy',column, {id:policyid}); 
     if(checkId){
       let updateData = {
        policyType : policyType,
        file_version:file_version,
        description:description, 
        optional_description:"",
        filename:filename,
        location:"test"

     }

    
     //let update =1;
       let update = await masters.common_update('policy', updateData, {id:policyid});
        if(update){
         let insertData_version = {
           default_id : checkId.id,
           filename:checkId.filename, 
           //location:checkId.location,
           description:checkId.description, 
           category_id:checkId.category_id,
           standard_id : checkId.frameworkid,
           title:checkId.policyname,
           pdflink:checkId.pdflink,
           status : req.body.status,
           createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
         }
         var ins_version = await masters.common_insert('default_files_version', insertData_version);
          
         return res.status(200).json({ status: true, message: 'data get successfully', data:[],statusCode:200});
        } else {
          return res.status(400).json({ status: false, message: 'data not updated'});
        }
    }else{
       return res.status(400).json({ status: false, message: ' details not found'});
  }
    
   },
   policylist: async function(req,res){
    var finalData = {};
    var where = {};
    where['status'] = '1';
    var orderby = 'createddate DESC';
    var columns = ['policy.id', 'policy.frameworkid', 'policy.policyname', 'policy.primaryassignee', 'policy.reccurenceid', 'policy.departmentsid', 'policy.policyrequirements', 'policy.status', 'policy.file_version', 'policy.filename', 'policy.location', 'policy.pdflink', 'policy.description', 'policy.optional_description', 'policy.policyType','framework.name as frameworkname','users.fname as primaryassignefname','users.lname as primaryassignelname','reccurence.name as reccurencename','Department.departmentname as Departmentname'];
   // var response = await masters.get_definecol_bytbl_cond_sorting(columns,'default_files', where, orderby );
   // finalData.data = response; 
   // return res.status(200).json({status: true, message: ' list fetched successfully', data: finalData});

    var joins = [
      {
          table: 'framework as framework',
          condition: ['policy.frameworkid', '=', 'framework.id'],
          jointype: 'LEFT'
      },
      {
        table: 'users',
        condition: ['policy.primaryassignee', '=', 'users.id'],
        jointype: 'LEFT'
    },
    {
      table: 'reccurence',
      condition: ['policy.reccurenceid', '=', 'reccurence.id'],
      jointype: 'LEFT'
  },
  {
    table: 'Department',
    condition: ['policy.departmentsid', '=', 'Department.id'],
    jointype: 'LEFT'
}
  ];
  var orderby = 'policy.createddate DESC';

  var where = {'policy.status':1};

  var extra_whr = '';
  var limit_arr = '';
  //var columns = ['default_files.id','default_files.pdflink','default_files.title','default_files.file_version','default_files.category_id','default_files.filename','default_files.location','default_files.description','default_files.status','policycategory.name as categoryname','standard.name as standardname'];
  //    var limit_arr = { 'limit': 10, 'offset': 1 };
  var result = await apiModel.get_joins_records('policy', columns, joins, where, orderby, extra_whr, limit_arr);

  var joins_apr = [{
    table:'users',
    condition:['policy_approver_mapping.approverid','=','users.id'],
   jointype:'LEFT'
  }]
  var where_apr = {}
  where_apr['policy_approver_mapping.policyid']=policyid;
  where_apr['policy_approver_mapping.status'] =1;
  var columns_apr = ['users.fname','users.lname','policy_approver_mapping.approverid'];
  var orderby_apr = 'policy_approver_mapping.createddate DESC'
  var approver_mapping =  await apiModel.get_joins_records('policy_approver_mapping', columns_apr, joins_apr, where_apr, orderby_apr, extra_whr, limit_arr);
  
  var joins_own = [{
    table:'users',
    condition:['policy_owner_mapping.ownerid','=','users.id'],
   jointype:'LEFT'
  }]
  var where_own = {}
  where_own['policy_owner_mapping.policyid']=policyid;
  where_own['policy_owner_mapping.status'] =1;
  var columns_own = ['users.fname','users.lname','policy_owner_mapping.ownerid'];
  var orderby_own= 'policy_owner_mapping.createddate DESC'
  var owner_mapping =  await apiModel.get_joins_records('policy_owner_mapping', columns_own, joins_own, where_own, orderby_own, '', '');
  
  var joins_clause = [{
    table:'clause',
    condition:['policycluse_mapping.clauseid','=','clause.id'],
   jointype:'LEFT'
  },{
    table:'sub_clause',
    condition:['policycluse_mapping.subclauseid','=','sub_clause.id'],
   jointype:'LEFT'
  }]
  var where_clause = {}
  where_clause['policycluse_mapping.policyid']=policyid;
  where_clause['policycluse_mapping.status'] =1;
  var columns_clause = ['policycluse_mapping.clauseid','policycluse_mapping.subclauseid','clause.clause','sub_clause.sabclause'];
  var orderby_clause= 'policycluse_mapping.createddate DESC'
  var clause_mapping =  await apiModel.get_joins_records('policycluse_mapping', columns_clause, joins_clause, where_clause, orderby_clause, '', '');
  
  var joins_control = [{
    table:'control',
    condition:['policycontral_mapping.controlid','=','control.id'],
   jointype:'LEFT'
  },{
    table:'subcontrol',
    condition:['policycontral_mapping.subcontrolid','=','subcontrol.id'],
   jointype:'LEFT'
  }]
  var where_control = {}
  where_control['policycontral_mapping.policyid']=policyid;
  where_control['policycontral_mapping.status'] =1;
  var columns_control = ['policycontral_mapping.controlid','policycontral_mapping.subcontrolid','control.name as controlname','subcontrol.name as subcontrolname'];
  var orderby_control= 'policycontral_mapping.createddate DESC'
  var control_mapping =  await apiModel.get_joins_records('policycontral_mapping', columns_control, joins_control, where_control, orderby_control, '', '');
  

  return res.status(200).json({ status: true, message: 'fetched successfully', data: result,'approver_mapping':approver_mapping,'owner_mapping':owner_mapping,'cluse_mapping':clause_mapping,'control_mapping':control_mapping, statusCode: 200});
  
},
approverlist: async function(req,res){
  var finalData = {};
  var policyid=req.body.data.policyid===undefined ? NULL : req.body.data.policyid;
  var joins_apr = [{
    table:'users',
    condition:['policy_approver_mapping.approverid','=','users.id'],
   jointype:'LEFT'
  }]
  var where_apr = {}
  where_apr['policy_approver_mapping.policyid']=policyid;
  where_apr['policy_approver_mapping.status'] =1;
  var columns_apr = ['users.fname','users.lname','policy_approver_mapping.approverid','policy_approver_mapping.policyid','policy_approver_mapping.approverstatus','policy_approver_mapping.approverid'];
  var orderby_apr = 'policy_approver_mapping.createddate DESC'
  var approver_mapping =  await apiModel.get_joins_records('policy_approver_mapping', columns_apr, joins_apr, where_apr, orderby_apr, '', '');
  finalData.data = approver_mapping;
  return res.status(200).json({status: true, message: ' list fetched successfully', data:finalData,statusCode:200});
},
approvepolicy:async function(req,res){
  var finalData = {};
  var policyid=req.body.data.policyid===undefined ? NULL : req.body.data.policyid;
  var approverid=req.body.data.approverid===undefined ? NULL : req.body.data.approverid;
  var approverstatus=req.body.data.approverstatus===undefined ? NULL : req.body.data.approverstatus;
  let updateData = {
    policyid : policyid,
    approverid:approverid,
    approverstatus:approverstatus,
    updateddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
   }
   var column = ['id'];
let checkId = await masters.getSingleRecord('policy_approver_mapping',column, {policyid:policyid,approverid:approverid}); 
if(checkId){
let update = await masters.common_update('policy_approver_mapping', updateData, {policyid:policyid,approverid:approverid});
 if(update){   
  return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
 } else {
   return res.status(400).json({ status: false, message: 'data not updated'});
 }
}else{
return res.status(400).json({ status: false, message: ' details not found'});
} 
},
rejectpolicylist:async function(req,res){
  var approverid=req.body.data.userid===undefined ? NULL : req.body.data.userid;
  var joins_apr = [{

     table:'policy',
    condition:['policy.id','=','policy_approver_mapping.policyid'],
   jointype:'LEFT'
  }]
  var where_apr = {}
  var extra_whr = {}
  var limit_arr = {}
  where_apr['policy_approver_mapping.approverid']=approverid;
  where_apr['policy_approver_mapping.status'] =1;
  where_apr['policy_approver_mapping.approverstatus'] =2;
  var columns_apr = ['policy_approver_mapping.approverid','policy_approver_mapping.status','policy_approver_mapping.approverstatus','policy_approver_mapping.policyid','policy.policyname'];
  var orderby_apr = 'policy_approver_mapping.createddate DESC'
  var approver_mapping =  await apiModel.get_joins_records('policy_approver_mapping', columns_apr, joins_apr, where_apr, orderby_apr, '', '');
  return res.status(200).json({status: true, message: ' details fetched successfully', data: approver_mapping});

},

addquiz:async function(req,res){
  var quizname=req.body.data.quizname===undefined ? NULL : req.body.data.quizname;
  var description=req.body.data.description===undefined ? NULL : req.body.data.description;
  var Totalquestion=req.body.data.Totalquestion===undefined ? NULL : req.body.data.Totalquestion;
  var PassingMarks=req.body.data.PassingMarks===undefined ? NULL : req.body.data.PassingMarks;
  var NoofRetakeAllowed=req.body.data.NoofRetakeAllowed===undefined ? NULL : req.body.data.NoofRetakeAllowed;
  var Retakeallowedornot=req.body.data.Retakeallowedornot===undefined ? NULL : req.body.data.Retakeallowedornot;
  var createdby=req.body.data.createdby===undefined ? NULL : req.body.data.createdby;
  let insertData = {
    quizname:quizname,
    description:description,
    Totalquestion:Totalquestion,
    PassingMarks:PassingMarks,
    NoofRetakeAllowed:NoofRetakeAllowed,
    Retakeallowedornot:Retakeallowedornot,
   // status:status,
    createdby : req.body.data.createdby,
    createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  }
  var ins = await masters.common_insert('quiz', insertData);
  if(ins){
    return res.status(200).json({ status: true, message: 'data insert successfully', data:insertData,statusCode:200});
  } else {
   res.status(422).json({status: false, error: 'Please try Again'}); 
  }
},
quizlist:async function(req,res){
  var finalData = {};
  var where = {};
  where['status'] = '1';
  var orderby = 'id ASC';
  var columns = ['id', 'quizname', 'description', 'Totalquestion', 'PassingMarks', 'NoofRetakeAllowed', 'Retakeallowedornot'];
  var response = await masters.get_definecol_bytbl_cond_sorting(columns,'quiz', where, orderby );
  finalData.data = response; 
  return res.status(200).json({status: true, message: 'Quiz list fetched successfully', data: response});

},
quizdetails:async function(req,res){
  var quizid=req.body.data.quizid===undefined ? NULL : req.body.data.quizid;
  var finalData = {};
  var where = {};
  where['status'] = '1';
  where['id'] = quizid;
  var orderby = 'id ASC';
  var columns = ['id', 'quizname', 'description', 'Totalquestion', 'PassingMarks', 'NoofRetakeAllowed', 'Retakeallowedornot'];
  var response = await masters.get_definecol_bytbl_cond_sorting(columns,'quiz', where, orderby );
  finalData.data = response; 
  return res.status(200).json({status: true, message: 'Quiz details fetched successfully', data: response});

},
quizupdate: async function(req,res){
  var quizid=req.body.data.quizid===undefined ? NULL : req.body.data.quizid;
  var quizname=req.body.data.quizname===undefined ? NULL : req.body.data.quizname;
  var description=req.body.data.description===undefined ? NULL : req.body.data.description;
  var Totalquestion=req.body.data.Totalquestion===undefined ? NULL : req.body.data.Totalquestion;
  var PassingMarks=req.body.data.PassingMarks===undefined ? NULL : req.body.data.PassingMarks;
  var NoofRetakeAllowed=req.body.data.NoofRetakeAllowed===undefined ? NULL : req.body.data.NoofRetakeAllowed;
  var Retakeallowedornot=req.body.data.Retakeallowedornot===undefined ? NULL : req.body.data.Retakeallowedornot;
  var updatedby=req.body.data.updatedby===undefined ? NULL : req.body.data.updatedby;
  var status=req.body.data.status===undefined ? NULL : req.body.data.status;
  let updateData = {
    quizname:quizname,
    description:description,
    Totalquestion:Totalquestion,
    PassingMarks:PassingMarks,
    NoofRetakeAllowed:NoofRetakeAllowed,
    Retakeallowedornot:Retakeallowedornot,
   status:status,
   updatedby : updatedby,
    createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  }
       var column = ['id'];
  let checkId = await masters.getSingleRecord('quiz',column, {id:quizid}); 
  if(checkId){
    let update = await masters.common_update('quiz', updateData, {id:quizid});
     if(update){   
      return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
     } else {
       return res.status(400).json({ status: false, message: 'data not updated'});
     }
 }else{
    return res.status(400).json({ status: false, message: ' details not found'});
} 

},
addquestion:async function(req,res){
  var Quizid=req.body.data.Quizid===undefined ? NULL : req.body.data.Quizid;
  var Question=req.body.data.Question===undefined ? NULL : req.body.data.Question;
  var ANSWER1=req.body.data.ANSWER1===undefined ? NULL : req.body.data.ANSWER1;
  var ANSWER2=req.body.data.ANSWER2===undefined ? NULL : req.body.data.ANSWER2;
  var ANSWER3=req.body.data.ANSWER3===undefined ? NULL : req.body.data.ANSWER3;
  var ANSWER4=req.body.data.ANSWER4===undefined ? NULL : req.body.data.ANSWER4;
  var CORRECTANSWER1=req.body.data.CORRECTANSWER1===undefined ? NULL : req.body.data.CORRECTANSWER1;
  //var status=req.body.data.status===undefined ? NULL : req.body.data.status;
  var createdby=req.body.data.createdby===undefined ? NULL : req.body.data.createdby;
  let insertData = {
    Quizid:Quizid,
    Question:Question,
    ANSWER1:ANSWER1,
    ANSWER2:ANSWER2,
    ANSWER3:ANSWER3,
    ANSWER4:ANSWER4,
    CORRECTANSWER1:CORRECTANSWER1,
    //status:status,
    createdby : createdby,
    createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  }
  var ins = await masters.common_insert('question', insertData);
  if(ins){
    return res.status(200).json({ status: true, message: 'data insert successfully', data:insertData,statusCode:200});
  } else {
   res.status(422).json({status: false, error: 'Please try Again'}); 
  }
},
questionlist:async function(req,res){
  var finalData = {};
  var where = {};
  where['status'] = '1';
  var orderby = 'id ASC';
  var columns = ['id','Question', 'ANSWER1', 'ANSWER2', 'ANSWER3', 'ANSWER4', 'CORRECTANSWER1','status'];
  var response = await masters.get_definecol_bytbl_cond_sorting(columns,'question', where, orderby );
  finalData.data = response; 
  return res.status(200).json({status: true, message: 'Question list fetched successfully', data: response});

},
questiondetails:async function(req,res){
  var questionid=req.body.data.questionid===undefined ? NULL : req.body.data.questionid;
  var finalData = {};
  var where = {};
  where['status'] = '1';
  where['id'] = questionid;
  var orderby = 'id ASC';
  var columns = ['id','Question', 'ANSWER1', 'ANSWER2', 'ANSWER3', 'ANSWER4', 'CORRECTANSWER1','status'];
  var response = await masters.get_definecol_bytbl_cond_sorting(columns,'question', where, orderby );
  finalData.data = response; 
  return res.status(200).json({status: true, message: 'Question details fetched successfully', data: response});

},
questionupdate: async function(req,res){
  var questionid=req.body.data.questionid===undefined ? NULL : req.body.data.questionid;
  var Quizid=req.body.data.Quizid===undefined ? NULL : req.body.data.Quizid;
  var Question=req.body.data.Question===undefined ? NULL : req.body.data.Question;
  var ANSWER1=req.body.data.ANSWER1===undefined ? NULL : req.body.data.ANSWER1;
  var ANSWER2=req.body.data.ANSWER2===undefined ? NULL : req.body.data.ANSWER2;
  var ANSWER3=req.body.data.ANSWER3===undefined ? NULL : req.body.data.ANSWER3;
  var ANSWER4=req.body.data.ANSWER4===undefined ? NULL : req.body.data.ANSWER4;
  var CORRECTANSWER1=req.body.data.CORRECTANSWER1===undefined ? NULL : req.body.data.CORRECTANSWER1;
  var status=req.body.data.status===undefined ? NULL : req.body.data.status;
  var updatedby=req.body.data.updatedby===undefined ? NULL : req.body.data.updatedby;
  let updateData = {
    Quizid:Quizid,
    Question:Question,
    ANSWER1:ANSWER1,
    ANSWER2:ANSWER2,
    ANSWER3:ANSWER3,
    ANSWER4:ANSWER4,
    CORRECTANSWER1:CORRECTANSWER1,
    status:status,
    updatedby : updatedby
  }
       var column = ['id'];
  let checkId = await masters.getSingleRecord('question',column, {id:questionid}); 
  if(checkId){
    let update = await masters.common_update('question', updateData, {id:questionid});
     if(update){   
      return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
     } else {
       return res.status(400).json({ status: false, message: 'data not updated'});
     }
 }else{
    return res.status(400).json({ status: false, message: ' details not found'});
} 

},
quizfilter:async function(req,res){
  var finalData = {};
  var where = {};
  where['status'] = '1';
  var orderby = 'id ASC';
  var columns = ['id', 'quizname'];
  var response = await masters.get_definecol_bytbl_cond_sorting(columns,'quiz', where, orderby );
  finalData.data = response; 
  return res.status(200).json({status: true, message: 'Quiz filter fetched successfully', data: response});

},
downloadpolicy:async function(req,res){
  var final_data = {};
  var id=req.body.data.id===undefined ? NULL : req.body.data.id;
const baseUrl = __appBaseUrl;
var column = ['*'];
let checkId = await masters.getSingleRecord('policy',column, {id:id});
var column_company = ['companyname','logo'];
let company_details = await masters.getSingleRecord('setting',column_company, {id:1});
var logo =  __appBaseUrl+'api/user/downloadPdfFile/'+company_details.logo;
console.log(checkId.filename);
var file_name = checkId.filename;
if(file_name==null || file_name==''){
var fileName = Date.now()+".pdf"
const pdfPath = __uploadDir+'/reports/pdf/'+fileName;
const rootPath = path.resolve("./");
const htmlData = pug.renderFile(rootPath+'/app/views/pdfview.pug', {
  baseUrl: baseUrl,
  data: checkId,
  companyname:company_details.companyname,
  logo:logo
});

var html = htmlData;
var options = { format: 'A4', orientation: "portrait" };  

let updateData = {
  filename : fileName,
  updatedby:req.body.data.updatedby, 
 // status : req.body.data.status===undefined ? checkId.status : req.body.data.status,
 updateddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
}
   let update = await masters.common_update('policy', updateData, {id:id}); 
pdf.create(html, options).toFile(pdfPath, function(err, response) {
 // final_data = '';
  if (err) return console.log(err);
  const downloadLink = __appBaseUrl+'api/user/downloadpolicyPdfFile/'+fileName;
  final_data.url = downloadLink;
 update =  masters.common_update('policy', {"pdflink":downloadLink}, {id:id});
  return res.status(200).json({status: true, message: 'download link received successfully', data: final_data});
});
} else {

const downloadLink = __appBaseUrl+'api/user/downloadpolicyPdfFile/'+file_name;
final_data.url = downloadLink;
   update =  masters.common_update('policy', {"pdflink":downloadLink}, {id:id});
return res.status(200).json({status: true, message: 'download link received successfully', data: final_data});
}
},
downloadpolicyPdfFile: async function(req, res) {
  var fileName = req.params.filename;
 const filePath = __uploadDir+'/reports/pdf/'+fileName;
  res.sendFile(filePath);
},
pendingpolicylist:async function(req,res){
  var approverid=req.body.data.userid===undefined ? NULL : req.body.data.userid;
  var joins_apr = [{
    table:'policy',
    condition:['policy.id','=','policy_approver_mapping.policyid'],
   jointype:'LEFT'
  }]
  var where_apr = {}
  var extra_whr = {}
  var limit_arr = {}
  where_apr['policy_approver_mapping.approverid']=approverid;
  where_apr['policy_approver_mapping.status'] =1;
  where_apr['policy_approver_mapping.approverstatus'] =0;
  var columns_apr = ['policy_approver_mapping.approverid','policy_approver_mapping.status','policy_approver_mapping.approverstatus','policy_approver_mapping.policyid','policy.policyname'];
  var orderby_apr = 'policy_approver_mapping.createddate DESC'
  var approver_mapping =  await apiModel.get_joins_records('policy_approver_mapping', columns_apr, joins_apr, where_apr, orderby_apr, '', '');
  return res.status(200).json({status: true, message: ' details fetched successfully', data: approver_mapping});

},
approvedpolicylist: async function(req,res){
  var approverid=req.body.data.userid===undefined ? NULL : req.body.data.userid;
  var joins_apr = [{
    table:'policy',
    condition:['policy.id','=','policy_approver_mapping.policyid'],
   jointype:'LEFT'
  }]
  var where_apr = {}
  var extra_whr = {}
  var limit_arr = {}
  where_apr['policy_approver_mapping.approverid']=approverid;
  where_apr['policy_approver_mapping.status'] =1;
  where_apr['policy_approver_mapping.approverstatus'] =1;
  var columns_apr = ['policy_approver_mapping.approverid','policy_approver_mapping.status','policy_approver_mapping.approverstatus','policy_approver_mapping.policyid','policy.policyname'];
  var orderby_apr = 'policy_approver_mapping.createddate DESC'
  var approver_mapping =  await apiModel.get_joins_records('policy_approver_mapping', columns_apr, joins_apr, where_apr, orderby_apr, '', '');
  return res.status(200).json({status: true, message: ' details fetched successfully', data: approver_mapping});

},
Assettype: async function(req,res){
  var finalData = {};
  var where = {};
  where['status'] = '1';
  var orderby = 'createddate DESC';
  var columns = ['id as value','AssetTypeName as label'];
  var response = await masters.get_definecol_bytbl_cond_sorting(columns,'AssetManagement', where, orderby );
  finalData.data = response; 
  console.log(response)
  return res.status(200).json({status: true, message: ' list fetched successfully', data:finalData,statusCode:200});
},
addAssetInventory:async function(req,res){
  var AssetName=req.body.data.AssetName===undefined ? NULL : req.body.data.AssetName;
  var Assettypeid=req.body.data.Assettypeid===undefined ? NULL : req.body.data.Assettypeid;
  var AssetNumber=req.body.data.AssetNumber===undefined ? NULL : req.body.data.AssetNumber;
  var serialnumber=req.body.data.serialnumber===undefined ? NULL : req.body.data.serialnumber;
  var Owneremail=req.body.data.Owneremail===undefined ? NULL : req.body.data.Owneremail;
  var departmentid=req.body.data.departmentid===undefined ? NULL : req.body.data.departmentid;
  var inDate=req.body.data.inDate===undefined ? NULL : req.body.data.inDate;
  var location=req.body.data.location===undefined ? NULL : req.body.data.location;
  var dispostiondate=req.body.data.dispostiondate===undefined ? NULL : req.body.data.dispostiondate;
  var dispositionmethod=req.body.data.dispositionmethod===undefined ? NULL : req.body.data.dispositionmethod;
  var ConfidentialityRequirements=req.body.data.ConfidentialityRequirements===undefined ? NULL : req.body.data.ConfidentialityRequirements;
  var IntegrityRequirements=req.body.data.IntegrityRequirements===undefined ? NULL : req.body.data.IntegrityRequirements;
  var AvailabilityRequirements=req.body.data.AvailabilityRequirements===undefined ? NULL : req.body.data.AvailabilityRequirements;
  var AmcEndDate=req.body.data.AmcEndDate===undefined ? NULL : req.body.data.AmcEndDate;
  //var createdby=req.body.data.createdby===undefined ? NULL : req.body.data.createdby;
  //var createdby=req.body.data.createdby===undefined ? NULL : req.body.data.createdby;

  //var status=req.body.data.status===undefined ? NULL : req.body.data.status;
  var createdby=req.body.data.createdby===undefined ? NULL : req.body.data.createdby;
  let insertData = {
    AssetName:AssetName,
    Assettypeid:Assettypeid,
    AssetNumber:AssetNumber,
    serialnumber:serialnumber,
    Owneremail:Owneremail,
    departmentid:departmentid,
    inDate:inDate,
    location:location,
    dispostiondate:dispostiondate,
    dispositionmethod:dispositionmethod,
    ConfidentialityRequirements:ConfidentialityRequirements,
    IntegrityRequirements:IntegrityRequirements,
    AvailabilityRequirements:AvailabilityRequirements,
    AmcEndDate:AmcEndDate,
    //status:status,
    createdby : createdby,
    createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  }
  var ins = await masters.common_insert('AssetInventory', insertData);
  if(ins){
    return res.status(200).json({ status: true, message: 'data insert successfully', data:insertData,statusCode:200});
  } else {
   res.status(422).json({status: false, error: 'Please try Again'}); 
  }
},
AssetInventorydetails: async function(req,res){
  var id=req.body.data.id===undefined ? NULL : req.body.data.id;
  var joins_apr = [{
    table:'Department',
    condition:['AssetInventory.departmentid','=','Department.id'],
   jointype:'LEFT'
  }
  ,{
    table:'AssetManagement',
    condition:['AssetInventory.Assettypeid','=','AssetManagement.id'],
   jointype:'LEFT'
  }
]
  var where_apr = {}
  var extra_whr = {}
  var limit_arr = {}
  where_apr['AssetInventory.id']=id;
  where_apr['AssetInventory.status'] =1;
  //where_apr['policy_approver_mapping.approverstatus'] =1;
  var columns_apr = ['AssetInventory.AssetName','AssetInventory.Assettypeid','AssetInventory.AssetNumber','AssetInventory.serialnumber','AssetInventory.Owneremail','AssetInventory.departmentid','AssetInventory.inDate','AssetInventory.location','AssetInventory.dispostiondate','AssetInventory.dispositionmethod','AssetInventory.ConfidentialityRequirements','AssetInventory.IntegrityRequirements','AssetInventory.AvailabilityRequirements','AssetInventory.AmcEndDate','Department.departmentname','AssetManagement.AssetTypeName'];
  var orderby_apr = 'AssetInventory.createddate DESC'
  var approver_mapping =  await apiModel.get_joins_records('AssetInventory', columns_apr, joins_apr, where_apr, orderby_apr, '', '');
  return res.status(200).json({status: true, message: ' details fetched successfully', data: approver_mapping});
},
  adddepartment: async function(req,res){
      console.log(req.body);
      let checkId = await masters.check_exist('department', {departmentname:req.body.departmentname,status:'1'});
       if(checkId){
       return res.status(422).json({status: false, error: 'Department name Already exits'}); 
       }
      let insertData = {
        departmentname : req.body.departmentname,
        DepartmentShortName : req.body.DepartmentShortName,
        DepartmentDetails : req.body.DepartmentDetails,
        createdby:req.body.createdby, 
        status : req.body.status,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
      var ins = await masters.common_insert('department', insertData);
      if(ins){
        return res.status(200).json({ status: true, message: 'data insert successfully', data:insertData,statusCode:200});
      } else {
       res.status(422).json({status: false, error: 'Please try Again'}); 
      }
    },
    updatedepartment: async function(req,res){
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var name = req.body.data.departmentname===undefined ? NULL : req.body.data.departmentname;
      var checkId_id = [];
      await knex.select('id').from('department')
        .whereRaw("departmentname = '"+name+"' and id != "+id+" and status=1")
        .then((result) => {
          checkId_id = result.length > 0 ? result[0] : false;
        }, (error) => {console.log(error);});
       if(checkId_id){
       return res.status(422).json({status: false, error: 'Please check the Department Already exits'}); 
       }
        var column = ['*'];
      let checkId = await masters.getSingleRecord('department',column, {id:id});
        if(checkId){
          let updateData = {
          departmentname : req.body.data.departmentname===undefined ? checkId.departmentname : req.body.data.departmentname,
          DepartmentShortName : req.body.data.DepartmentShortName===undefined ? checkId.DepartmentShortName : req.body.data.DepartmentShortName,
          DepartmentDetails : req.body.data.DepartmentDetails===undefined ? checkId.DepartmentDetails : req.body.data.DepartmentDetails,
          updatedby:req.body.data.updatedby===undefined ? checkId.updatedby : req.body.data.updatedby, 
          status : req.body.data.status===undefined ? checkId.status : req.body.data.status,
          createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }
            let update = await masters.common_update('department', updateData, {id:id});
            if(update){
              return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
            } else {
              return res.status(400).json({ status: false, message: 'data not updated'});
            }
        }else{
          return res.status(400).json({ status: false, message: ' details not found'});
        }

    },
    departmentslist:async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      //where['deletestatus'] = 0;
      var orderby = 'createddate DESC';
      var columns = ['*'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'department', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: 'Department list fetched successfully', data: response});

    },
  getdepartmentId:async function(req,res){
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var column = ['*'];
      let checkId = await masters.getSingleRecord('department',column, {id:id});
        if(checkId){
              return res.status(200).json({ status: true, message: 'data get successfully', data:checkId,statusCode:200});    
        }else{
          return res.status(400).json({ status: false, message: ' details not found'});
        }
      },
      AssetInventorydetails: async function(req,res){
        var id=req.body.data.id===undefined ? NULL : req.body.data.id;
        var joins_apr = [{
          table:'Department',
          condition:['AssetInventory.departmentid','=','Department.id'],
         jointype:'LEFT'
        }
        ,{
          table:'AssetManagement',
          condition:['AssetInventory.Assettypeid','=','AssetManagement.id'],
         jointype:'LEFT'
        }
      ]
        var where_apr = {}
        var extra_whr = {}
        var limit_arr = {}
        where_apr['AssetInventory.id']=id;
        where_apr['AssetInventory.status'] =1;
        //where_apr['policy_approver_mapping.approverstatus'] =1;
        var columns_apr = ['AssetInventory.AssetName','AssetInventory.Assettypeid','AssetInventory.AssetNumber','AssetInventory.serialnumber','AssetInventory.Owneremail','AssetInventory.departmentid','AssetInventory.inDate','AssetInventory.location','AssetInventory.dispostiondate','AssetInventory.dispositionmethod','AssetInventory.ConfidentialityRequirements','AssetInventory.IntegrityRequirements','AssetInventory.AvailabilityRequirements','AssetInventory.AmcEndDate','Department.departmentname','AssetManagement.AssetTypeName'];
        var orderby_apr = 'AssetInventory.createddate DESC'
        var approver_mapping =  await apiModel.get_joins_records('AssetInventory', columns_apr, joins_apr, where_apr, orderby_apr, '', '');
        return res.status(200).json({status: true, message: ' details fetched successfully', data: approver_mapping});
    },
    AssetInventorylist: async function(req,res){
      var joins_apr = [{
        table:'Department',
        condition:['AssetInventory.departmentid','=','Department.id'],
       jointype:'LEFT'
      }
      ,{
        table:'AssetManagement',
        condition:['AssetInventory.Assettypeid','=','AssetManagement.id'],
       jointype:'LEFT'
      }
    ]
      var where_apr = {}
      var extra_whr = {}
      var limit_arr = {}
      //where_apr['AssetInventory.approverid']=id;
      where_apr['AssetInventory.status'] =1;
      //where_apr['policy_approver_mapping.approverstatus'] =1;
      var columns_apr = ['AssetInventory.AssetName','AssetInventory.Assettypeid','AssetInventory.AssetNumber','AssetInventory.serialnumber','AssetInventory.Owneremail','AssetInventory.departmentid','AssetInventory.inDate','AssetInventory.location','AssetInventory.dispostiondate','AssetInventory.dispositionmethod','AssetInventory.ConfidentialityRequirements','AssetInventory.IntegrityRequirements','AssetInventory.AvailabilityRequirements','AssetInventory.AmcEndDate','Department.departmentname','AssetManagement.AssetTypeName'];
      var orderby_apr = 'AssetInventory.createddate DESC'
      var approver_mapping =  await apiModel.get_joins_records('AssetInventory', columns_apr, joins_apr, where_apr, orderby_apr, '', '');
      return res.status(200).json({status: true, message: ' details fetched successfully', data: approver_mapping});
    
    },
    updateAssetInventory:async function(req,res){
      var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      var AssetName=req.body.data.AssetName===undefined ? NULL : req.body.data.AssetName;
      var Assettypeid=req.body.data.Assettypeid===undefined ? NULL : req.body.data.Assettypeid;
      var AssetNumber=req.body.data.AssetNumber===undefined ? NULL : req.body.data.AssetNumber;
      var serialnumber=req.body.data.serialnumber===undefined ? NULL : req.body.data.serialnumber;
      var Owneremail=req.body.data.Owneremail===undefined ? NULL : req.body.data.Owneremail;
      var departmentid=req.body.data.departmentid===undefined ? NULL : req.body.data.departmentid;
      var inDate=req.body.data.inDate===undefined ? NULL : req.body.data.inDate;
      var location=req.body.data.location===undefined ? NULL : req.body.data.location;
      var dispostiondate=req.body.data.dispostiondate===undefined ? NULL : req.body.data.dispostiondate;
      var dispositionmethod=req.body.data.dispositionmethod===undefined ? NULL : req.body.data.dispositionmethod;
      var ConfidentialityRequirements=req.body.data.ConfidentialityRequirements===undefined ? NULL : req.body.data.ConfidentialityRequirements;
      var IntegrityRequirements=req.body.data.IntegrityRequirements===undefined ? NULL : req.body.data.IntegrityRequirements;
      var AvailabilityRequirements=req.body.data.AvailabilityRequirements===undefined ? NULL : req.body.data.AvailabilityRequirements;
      var AmcEndDate=req.body.data.AmcEndDate===undefined ? NULL : req.body.data.AmcEndDate;
      var updatedby=req.body.data.updatedby===undefined ? NULL : req.body.data.updatedby;
      let updateData = {
        AssetName:AssetName,
        Assettypeid:Assettypeid,
        AssetNumber:AssetNumber,
        serialnumber:serialnumber,
        Owneremail:Owneremail,
        departmentid:departmentid,
        inDate:inDate,
        location:location,
        dispostiondate:dispostiondate,
        dispositionmethod:dispositionmethod,
        ConfidentialityRequirements:ConfidentialityRequirements,
        IntegrityRequirements:IntegrityRequirements,
        AvailabilityRequirements:AvailabilityRequirements,
        AmcEndDate:AmcEndDate,
        //status:status,
        updatedby : updatedby,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
      var column = ['id'];
      let checkId = await masters.getSingleRecord('AssetInventory',column, {id:id}); 
      if(checkId){
        let update = await masters.common_update('AssetInventory', updateData, {id:id});
         if(update){   
          return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
         } else {
           return res.status(400).json({ status: false, message: 'data not updated'});
         }
     }else{
        return res.status(400).json({ status: false, message: ' details not found'});
    } 
    
    },      
};

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
var fileHelper = require(process.cwd()+'/app/shared/helpers/file');
//var pdf = require("pdf-creator-node");
const PDFDocument = require('pdfkit');
var storage =   multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, './uploads');  
  },  
  filename: function (req, file, callback) {  
    callback(null, file.originalname);  
  }  
});  
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
      
      var filename = req.body.data.filename;
      var location = "test";
      let insertData = {
      filename : filename,
      location:location, 
      description:req.body.data.description, 
      category_id:req.body.data.category_id, 
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
       var id=req.body.id===undefined ? 1 : req.body.id;
       var column = ['filename', 'location', 'description','description','category_id'];
    let checkId = await masters.getSingleRecord('default_files',column, {id:id});
      if(checkId){
        var docs = req.file;
        if(req.file){
        var filename = req.file.filename;
        var location = req.file.path;
        } else {
          var filename = checkId.filename;
          var location = checkId.location;
        }
        let updateData = {
        filename : filename,
        location:location, 
        description : req.body.description===undefined ? checkId.description : req.body.description,
        category_id:req.body.category_id===undefined ? checkId.category_id : req.body.category_id, 
        status : req.body.status===undefined ? checkId.status : req.body.status,
        createddate:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      }
          let update = await masters.common_update('default_files', updateData, {id:id});
          if(update){
            return res.status(200).json({ status: true, message: 'data get successfully', data:updateData,statusCode:200});
          } else {
            return res.status(400).json({ status: false, message: 'data not updated'});
          }
      }else{
        return res.status(400).json({ status: false, message: ' details not found'});
      }
     
    },
    defaultfilelist: async function(req,res){
      var finalData = {};
      var where = {};
      where['status'] = '1';
      var orderby = 'createddate DESC';
      var columns = ['id','category_id','filename','location','description','status'];
      var response = await masters.get_definecol_bytbl_cond_sorting(columns,'default_files', where, orderby );
      finalData.data = response; 
      return res.status(200).json({status: true, message: ' list fetched successfully', data: finalData});
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
    //   downloadpdf:async function(req,res){
    //     var html = fs.readFileSync(process.cwd()+'/app/views/templete.pug', 'utf8');
    //     var options = { format: 'A4', orientation: "portrait" };
    //     var users = [
    //       {
    //           name:"Shyam",
    //           age:"26"
    //       },
    //       {
    //           name:"Navjot",
    //           age:"26"
    //       },
    //       {
    //           name:"Vitthal",
    //           age:"26"
    //       }
    //   ]
    //   var document = {
    //       html: html,
    //       data: {
    //           users: users
    //       },
    //       path: "./output.pdf"
    //   };
    //   pdf.create(document, options)
    // .then(res => {
    //     console.log(res)
    // })
    // .catch(error => {
    //     console.error(error)
    // });
    //     return res.status(400).json({ status: false, message: ' details not found'});
    //   },
      downloadpdf:async function(req,res){
        var final_data = {};
        var id=req.body.data.id===undefined ? NULL : req.body.data.id;
      const baseUrl = __appBaseUrl;
      var column = ['id','description'];
      let checkId = await masters.getSingleRecord('default_files',column, {id:id});
      const fileName = Date.now()+".pdf"
      const pdfPath = __uploadDir+'/reports/pdf/'+fileName;
      //const pdfPath = fileName;

      console.log(pdfPath);
      const rootPath = path.resolve("./");
      const htmlData = pug.renderFile(rootPath+'/app/views/pdfview.pug', {
        baseUrl: baseUrl,
        data: checkId
      });

      var html = htmlData;
      var options = { format: 'A4', orientation: "portrait" };
      // pdf.create(html, {
      //   childProcessOptions: {
      //     env: {
      //       OPENSSL_CONF: '/dev/null',
      //     },
      //   }
      // }); 
      pdf.create(html, options).toFile(pdfPath, function(err, response) {
       // final_data = '';
        if (err) return console.log(err);
         const downloadLink = __appBaseUrl+'api/user/downloadPdfFile/'+fileName;
        final_data.url = downloadLink;
         return res.status(200).json({status: true, message: 'download link received successfully 1', data: final_data});
       });
            // return res.status(200).json({status: true, message: 'download link received successfully', data: 'yyy'});

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
       //console.log(req.params);
       // console.log(fileName);
       // var fileName = '1.pdf';
      const filePath = __uploadDir+'/reports/pdf/'+fileName;
      // var status = await fileHelper.download_any_file(filePath, req, res, false);
       res.sendFile(filePath);
        //SHOW IN BROWSER
       // var status = await fileHelper.show_pdf_file_browser(filePath, req, res, true);

       // if(status == false) {
           // return res.status(200).send('Error: no such file or directory')
       // }
    },
};

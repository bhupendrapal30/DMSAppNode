const express = require('express');
const router = express.Router();
var authController = require('../controllers/authController');
let authMiddleware = require('../../../shared/middlewares/authMiddleware');

var userController = require('../controllers/userController');
const multer  = require('multer');
const { checkToken } = require('../../../shared/middlewares/authMiddleware');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, './uploads/reports/pdf/')
	},
	filename: function (req, file, cb) {
	  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
	 // cb(null, file.originalname + '-' + uniqueSuffix)
	  cb(null, uniqueSuffix+file.originalname)
	//  cb(null, file.originalname)
	}
  })
  
  const upload = multer({ storage: storage })
//const upload = multer({ dest: 'uploads/' });
//ar cpUpload = upload.fields([{ name: 'image', maxCount: 1 }]);
router.post('/', function(req, res) {
	console.log(req.body.email);
	//var eventList =  knex.select('id').from('users').where('id',1)
	//console.log(eventList);
	res.status(200).json({message: 'this is login page.'});
});
router.post('/login', authController.getUserById);
router.post('/adduser',authMiddleware.checkToken, userController.addUser);
router.post('/updateuser',authMiddleware.checkToken, userController.updateUser);
router.post('/logout', userController.logout);
router.get('/userlist',authMiddleware.checkToken,userController.userlist);
router.get('/rolelist',authMiddleware.checkToken,userController.rolelist);
router.post('/fileupload',authMiddleware.checkToken, userController.fileUpload);
router.post('/fileupdate',authMiddleware.checkToken, userController.fileupdate);
router.get('/defaultfilelist',userController.defaultfilelist); 
router.post('/addrole',authMiddleware.checkToken,userController.addrole); 
router.post('/updaterole',authMiddleware.checkToken,userController.updaterole);
router.post('/deleteuser',authMiddleware.checkToken,userController.deleteuser);
router.post('/deleterole',authMiddleware.checkToken,userController.deleterole);
router.post('/getuserbyid',authMiddleware.checkToken,userController.getuserbyId);
router.post('/getrolebyid',authMiddleware.checkToken,userController.getrolebyId);
router.post('/getPolicyId',authMiddleware.checkToken,userController.getPolicyId);
router.get('/modulelist',authMiddleware.checkToken,userController.modulelist);
router.get('/rolelistingdata',authMiddleware.checkToken,userController.rolelistingdata); 
router.post('/addpermission',authMiddleware.checkToken,userController.addpermission);
router.post('/updatepermission',authMiddleware.checkToken,userController.updatepermission);
router.post('/permissionlist',authMiddleware.checkToken,userController.permissionlist);
router.post('/deletepermission',authMiddleware.checkToken,userController.deletepermission);
router.post('/getpermissionId',authMiddleware.checkToken,userController.getpermissionId);
router.post('/downloadpdf',userController.downloadpdf);
router.get('/downloadPdfFile/:filename',userController.downloadPdfFile);
router.get('/categorylist',authMiddleware.checkToken,userController.categorylist);
router.get('/standredlist',authMiddleware.checkToken,userController.standredlist);
router.post('/defaultfileversionlist',userController.defaultfilelist_version);

router.post('/clauselist',userController.clauselist);
router.post('/subclauselist',userController.subclauselist);

router.post('/defaultfilelist',userController.defaultfilelist);
router.get('/assigner',userController.assigner);
router.get('/owner',userController.owner);
router.get('/department',userController.department);
router.get('/reccurence',userController.reccurence);
router.post('/createpolicy',userController.createpolicy);
router.get('/frameworklist',userController.frameworklist);
router.get('/controlist',userController.controlist);
router.get('/subcontrolist',userController.subcontrolist);
router.post('/cratepolicyowner',userController.cratepolicyowner);
router.post('/cratepolicyapprover',userController.cratepolicyapprover);
router.post('/policyupdate',userController.policyupdate);
router.post('/policyfileupdate',upload.single('filename'),userController.policyfileupdate);
router.post('/controlist',userController.controlist);
router.post('/subcontrolist',userController.subcontrolist);
router.post('/getPolicyById',userController.getPolicyById);
router.post('/policydetails',userController.policydetails);
router.post('/cratepolicyowner',userController.cratepolicyowner);
router.post('/cratepolicyapprover',userController.cratepolicyapprover);
router.get('/policylist',userController.policylist);
router.post('/approverlist',userController.approverlist);
router.post('/approvepolicy',userController.approvepolicy);
router.post('/pendingpolicylist',userController.pendingpolicylist);
router.post('/approvedpolicylist',userController.approvedpolicylist);
router.post('/rejectpolicylist',userController.approvedpolicylist);

router.post('/adddepartment',authMiddleware.checkToken,userController.adddepartment); 
router.post('/updatedepartment',authMiddleware.checkToken,userController.updatedepartment);
router.post('/getdepartmentid',authMiddleware.checkToken,userController.getdepartmentId);
router.get('/departmentslist',authMiddleware.checkToken,userController.departmentslist); 


router.post('/addtraining',upload.single('trainingfile'),userController.addtraining);
router.get('/traininglist',userController.traininglist);
router.post('/traininupdate',upload.single('trainingfile'),userController.traininupdate);
router.get('/trainingdetail',userController.trainingdetail);
router.post('/policydetails',userController.policydetails);
router.get('/approverlist',userController.approverlist);
router.get('/approvepolicy',userController.approvepolicy);
router.post('/addquiz',userController.addquiz);
router.get('/quizlist',userController.quizlist);
router.get('/quizdetails',userController.quizdetails);
router.post('/quizupdate',userController.quizupdate);
router.post('/addquestion',userController.addquestion);
router.get('/questionlist',userController.questionlist);
router.get('/questiondetails',userController.questiondetails);
router.post('/questionupdate',userController.questionupdate);
router.get('/quizfilter',userController.quizfilter);
router.post('/downloadpolicy',userController.downloadpolicy);
router.get('/downloadpolicyPdfFile/:filename',userController.downloadpolicyPdfFile);
router.post('/pendingpolicylist',userController.pendingpolicylist);
router.post('/approvedpolicylist',userController.approvedpolicylist);
router.get('/Assettype',userController.Assettype);
router.post('/addAssetInventory',userController.addAssetInventory);
router.get('/AssetInventorylist',userController.AssetInventorylist);
router.get('/AssetInventorydetails',userController.AssetInventorydetails);
router.post('/updateAssetInventory',userController.updateAssetInventory);
module.exports = router;

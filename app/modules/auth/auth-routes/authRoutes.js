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
	  cb(null, file.originalname + '-' + uniqueSuffix)
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
router.get('/clauselist',userController.clauselist);
router.get('/subclauselist',userController.subclauselist);
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
router.get('/policylist',userController.policylist);
router.post('/addtraining',upload.single('trainingfile'),userController.addtraining);
router.get('/traininglist',userController.traininglist);
router.post('/traininupdate',upload.single('trainingfile'),userController.traininupdate);
router.get('/trainingdetail',userController.trainingdetail);
module.exports = router;

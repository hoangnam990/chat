var express = require('express');
var router = express.Router();
var session = require("express-session");
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator/check');
router.use(bodyParser.urlencoded({ extended: true }));
//var checkDuplicateUsername=require('../controller/validate/register')
//models
const userModel=require('../models/user');
/* GET users listing. */
var sess;
// //Login Router
router.get('/login',function(req, res, next) {
 sess=req.session;
 
 
 if(sess    .username)
    {
   console.log(sess.username);
        res.send('Ban da dang nhap roi');
        console.log('login: '+sess.username);
        return false;
    }
    res.render('login',{error:null});
 
 
 });
router.post('/login',(req,res,next)=>{
    sess=req.session;

    userModel.find((err,result)=>{
        var isLogin=false;

        for (let i = 0; i < result.length; i++){
            if (result[i].username==req.body.username && result[i].password==req.body.password){
                console.log('Dang nhap thanh cong !');
                console.log('User login : '+result[i].username);
            sess.username= result[i].username;
            console.log(sess.username);
            res.render('welcome',{username:result[i].username});
            isLogin=true;
            }
        }
        if(isLogin==false){ 
            console.log('Dang nhap that bai');
            sess.username="";
          
            res.render('login',{error:'Sai tên đăng nhập hoặc mật khẩu !'});
           
        }
        console.log('post ' +sess.username);
        console.log(isLogin);
  }); 
  });
  //Register Router
  router.get('/register', function(req, res, next) {
  sess=req.session;
 
    if(sess.username)
    {
   
        res.send('Ban da dang nhap roi');
         return false;
    }
    res.render('signup',{error:null});
 
 });

router.post('/register', function(req, res) {
var error=[];
    if(req.body.username.length<4){
      
       error.push('Username phải có độ dài trên 4 kí tự ');
   }
   if(req.body.username.length==0){
      
    error.push('Username không được phép rỗng');
}
if(checkDuplicateUsername('quang'))
{
    console.log('tai khoan da tonm tai');
    error.push('Tên tài khoản đã tồn tại, mời bạn chọn tên khác');
}
else {
    console.log('test thoi fail dang ky');
    var a=checkDuplicateUsername('quang');
    console.log(checkDuplicateUsername('quang'));
}

console.log('req.body: '+req.body.username);
if(error.length>0){
    res.render('signup',{error:error});
    console.log('Danh sach loi : ' +error);
    return ;
}
   
    let newUser=new userModel({
      username:req.body.username,
      email:req.body.email,
      password:req.body.password
  });
  
  newUser.save((err,data)=>{  
      if(err){
          console.log(err);
      }
      else{
          console.log('Dang ky thanh cong!!!');
      }
  });
  setTimeout(() => {  
      res.redirect('/login');   
  }, 1000);
  });
  //Logout Router
  router.get('/logout', function(req, res, next) {
    sess=req.session;
    if(sess.username==null)
    {
        res.end('Chua dang nhap');
    }
    else {
        req.session.destroy(function () {
            req.logout();
            res.render('logout');       
        });
    }
    console.log("logout:" +sess.username);
 });
 //Dashboard router
 router.get('/dashboard', function(req, res, next) {
    sess=req.session;
    if(sess.username==null)
    {
        res.end('Chua dang nhap');
    }
    else {
    res.render('dashboard');
    }
 });
router.get('/', function(req, res, next) {
    res.render('index',{username:'quang'});
 });

module.exports = router;

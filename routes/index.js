var express=require('express');
var router=express.Router();
var User=require('../models/user.js');
var CommentS=require('../models/comments.js');
var Article=require('../models/article.js');
var Follow=require('../models/follow.js');
var credentials=require('../credentials.js');
var emailService=require('../lib/email.js')(credentials);
var crypto=require('crypto');//加密模块


/*GET home page.*/
router.get('/',function (req,res,next) {
    //使用默认布局（main.hbs）
    res.render('home');
});

/*GET start page.*/
router.get('/start',function (req,res,next) {
    res.render('start');
});

/*GET study page.*/
router.get('/study',function (req,res,next) {
    res.render('study');
});

/*GET communication page.*/
// router.get('/communicate',function (req,res,next) {
//     res.render('communicate');
// });
router.post('/communicate',function (req,res,next) {
    res.render('communicate');
});

/*GET about page.*/
router.get('/about',function (req,res,next) {
    res.render('about');
});
/*GET 发表文章.*/
router.get('/publish',function (req,res,next) {
    res.render('publish');
});
/*GET 评论.*/
router.get('/article_of_one',function(req,res,nest){
    res.render('article_of_one');
});
/*GET login page.*/
router.get('/login',function (req,res,next) {
    res.render('login');
});

/*GET Personal Center page.*/
router.get('/PersonalCenter',function (req,res,next) {
    res.render('PersonalCenter');
});
/*GET register page.*/
router.get('/register',function (req,res,next) {
    res.render('register');
});
//用户注册数据存储
router.post('/register',registerFn);
//加密函数
// function hashPW(pwd) {
//     return crypto.createHash('sha256').update(pwd).digest('base64').toString();
// };
function registerFn(req,res) {
    var user=new User({username:req.body.name});
    user.set('email',req.body.email);
    user.set('password',req.body.password);
    user.save(function (err) {
        if(err){
            req.session.error=err;
            console.log("===存储失败！===");
            return res.redirect('/register');
        } else {
            console.log('===注册成功==='+user.id+'=='+req.body.name+'===pwd==='+user.password);
            emailService.send(req.body.email,'WEB--Show Me The Code.','注册成功,欢迎加入！！！');
            req.session.user=user.id;
            req.session.username=user.username;
            return res.redirect('/login');
        }
    })
};
//用户登录
router.post('/login',loginFn);
function loginFn(req,res,next){
    User.find({email:req.body.email})
        .exec(function (err,users) {
            var DATA={
                users:users.map(function (user) {
                    return {
                        _id:user._id,
                        name:user.username,
                        email:user.email,
                        password:user.password,
                    };
                })
            };
            if(DATA.users.length==0){
                req.session.errorSession='noThisEmail';
                return res.redirect('/login');
            }else{
                if(DATA.users[0].password==req.body.password){
                    req.session.userSession=DATA.users[0];
                    console.log(req.session.userSession);
                    return res.redirect('/communicate');
                }else{
                    req.session.errorSession='errPWD';
                    return res.redirect('/login');
                }
            };
        });
};
//传递错误登录信息
router.get('/errorSession',function(req,res,next){
    res.send(req.session.errorSession)
    res.end;
});
//传递登录信息
router.get('/session',function(req,res,next){
    res.send(req.session.userSession)
    res.end;
});
// 退出登录
router.get('/OutLogin',function(req,res,next){
    req.session.userSession='';
    req.session.errorSession='';
    return res.redirect('/communicate');
});

//发表文章
router.post('/publish',function (req,res,next) {
    var self=this;
    var now = new Date();
    self.timestr=Date.now();
    var article=new Article({author:req.session.userSession.name});
    article.set('article_head',req.body.publish_title);
    article.set('article_info',self.timestr);
    article.set('article_body',req.body.publish_content);
    article.save(function (err) {
        if(err){
            req.session.error=err;
            console.log("===存储失败！==="+req.session.error);
            return res.redirect('/publish');
        } else {
            console.log('===发表成功==='+article.id+'=='+req.body.publish_title);
            return res.redirect('/communicate');
        }
    });
});
//论坛获取文章
router.get('/communicate',function (req,res,next) {
    // 查找文章
    Article.find({},{author:true,article_head:true,article_info:true,article_body:true,count:true,like:true},function(err,articles){
        var data={
            articles:articles.map(function (article) {
                return {
                    _id : article._id,
                    author : article.author,
                    article_head : article.article_head,
                    article_info : article.article_info,
                    article_body : article.article_body,
                    count : article.count,
                    like : article.like,
                };
            })
        };
        if (data.articles.length>0){
            req.session.userArtcles=data.articles;
            console.log('找到所有文章！');
        };
        // res.send(data);
    });
    // 查找文章评论
    // CommentS.find({},{Article:true,content:true,preson:true,time:true},function(err,comments){
    //     var data={
    //         comments:comments.map(function (comment) {
    //             return {
    //                 _id : comment._id,
    //                 Article : comment.Article,
    //                 content : comment.content,
    //                 preson : comment.preson,
    //                 time : comment.time,
    //             };
    //         })
    //     };
    //     if (data.comments.length>0){
    //         req.session.articlecomments=data.comments;
    //         console.log('找到所有评论！');
    //     };
    //     // res.send(data);
    // });
    res.render('communicate');
});
//传递文章信息
router.get('/articleSession',function(req,res,next){
    res.send(req.session.userArtcles);
    res.end;
});
//传递文章评论信息
// router.get('/commentSession',function(req,res,next){
//     res.send(req.session.articlecomments);
//     res.end;
// });
//查看某一文章
router.get('/articleofone',function(req,res,next){
    // 增加浏览次数
    Article.update({ article_head: req.query.head }, { $inc: { count: 1 } })
    .exec();
    // 查找文章评论
    CommentS.find().where('Article').equals(req.query.head).exec(function(err,comments){
        var data={
            comments:comments.map(function (comment) {
                return {
                    _id : comment._id,
                    Article : comment.Article,
                    content : comment.content,
                    preson : comment.preson,
                    time : comment.time,
                };
            })
        };
        if (data.comments.length>0){
            req.session.commentsofone=data.comments;
            console.log('找到该文章评论');
        } else{
            console.log('没有评论啊');
        };
    });
    // 查找文章内容
    Article.find().where('article_head').equals(req.query.head).exec(function (err,articles) {
        var data={
            articles:articles.map(function (article) {
                return {
                    _id : article._id,
                    author : article.author,
                    article_head : article.article_head,
                    article_info : article.article_info,
                    article_body : article.article_body,
                    count : article.count,
                    like : article.like,
                };
            })
        };
        if (data.articles.length>0){
            req.session.dataOfone=data.articles[0];
            console.log('找到该文章');
        } else{
            console.log('没有啊');
        };
        res.send(data);
    });
});
// 传递1篇文章信息
router.get('/oneArticle',function(req,res,nest){
    res.send(req.session.dataOfone);
    res.end;
});
// 传递1篇文章的评论信息
router.get('/oneComments',function(req,res,nest){
    res.send(req.session.commentsofone);
    // console.log(req.session.commentsofone);
    res.end;
});
//评论
router.post('/article_of_one',function(req,res,next){
    var self=this;
    var now = new Date();
    self.timestr=Date.now();
    var comment=new CommentS({preson:req.session.userSession.name});
    comment.set('Article',req.session.dataOfone.article_head);
    comment.set('content',req.body.comment_content);
    comment.set('time',self.timestr);
    comment.save(function (err) {
        if(err){
            req.session.error=err;
            console.log("===存储失败！==="+req.session.error);
            return res.redirect('/article_of_one');
        } else {
            console.log('===评论成功==='+comment.preson+'=='+req.body.comment_content);
            return res.redirect('/communicate');
        }
    });

});

// 个人中心
router.get('/getPersonalMSG',function(req,res,next){
    // 查找文章评论
    CommentS.find({},{Article:true,content:true,preson:true,time:true},function(err,comments){
        var data={
            comments:comments.map(function (comment) {
                return {
                    _id : comment._id,
                    Article : comment.Article,
                    content : comment.content,
                    preson : comment.preson,
                    time : comment.time,
                };
            })
        };
        if (data.comments.length>0){
            req.session.personalArticlesComment=data.comments;
            console.log('找到所有评论！');
        };
        // res.send(data);
    });
    // 查找个人用户文章
    Article.find().where('author').equals(req.query.author).exec(function (err,articles) {
        var data={
            articles:articles.map(function (article) {
                return {
                    _id : article._id,
                    author : article.author,
                    article_head : article.article_head,
                    article_info : article.article_info,
                    article_body : article.article_body,
                    count : article.count,
                    like : article.like,
                };
            })
        };
        if (data.articles.length>0){
            req.session.personalArticles=data.articles;
            console.log('找到该用户信息');
        } else{
            console.log('没有啊');
        };
        res.send(data);
    });

});
router.get('/personalArticles',function(req,res,nest){
    res.send(req.session.personalArticles);
    res.end;
});
router.get('/personalArticlesComment',function(req,res,nest){
    res.send(req.session.personalArticlesComment);
    res.end;
});
// 删除文章
router.get('/delPersonalArt',function(req,res,next){
    Article.remove().where('article_head').equals(req.query.head).exec();
    CommentS.remove().where('Article').equals(req.query.head).exec();
    req.session.personalArticles.length=req.session.personalArticles.length-1;
    res.send(req.session.personalArticles);
    res.end;
});

module.exports = router;

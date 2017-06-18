angular.module('articleApp',[])
    //控制器
    .controller('articleController',['$http','$scope',function ($http,$scope) {
        var self=this;
        $http.get('/session').then(function (resp) {
            self.Email=resp.data.email;
            if (resp.data){
                self.info=resp.data.name;
                $('#logining').css('display','none');
            } else {
                $('#logined').css('display','none');
                // self.info='登录/注册';
            };
            checkLogin=function (){
                if(resp.data){
                    window.location='http://localhost:8803/publish';
                }else {
                    window.location='http://localhost:8803/login';
                }
            };
        });
        $http.get('/errorSession').then(function (resp) {
            var errMSG=resp.data;
            if(errMSG=='noThisEmail'){
                // alert('请检查你的用户名或密码是否正确！');
                self.messageFull='请检查你的--邮箱--是否正确?';
                return;
            }else if(errMSG=='errPWD'){
                self.messageFull='请检查你的--密码--是否正确?';
                return;
            }
        });
        //论坛主页列出文章
        $http.get('/articleSession').then(function (resp) {
            var DATAStr=[];
            for (var i = 0; i < resp.data.length; i++) {
                if (resp.data[i].article_head) {
                    DATAStr[i]=resp.data[i];
                }
            };
            console.log(DATAStr);
            self.DATA=DATAStr.reverse();
        });
        // 列出文章评论
        // $http.get('/commentSession').then(function (resp){
        //     var CommentS=new Array();
        //     for (var i = 0; i < self.DATA.length; i++) {
        //         CommentS[i]=new Array();
        //         var k=-1;
        //         for (var j = 0; j < resp.data.length; j++) {
        //             if(self.DATA[i].article_head==resp.data[j].Article){
        //                 k++;
        //                 CommentS[i][k]=resp.data[j];
        //             }
        //         };
        //     };
        //     console.log(CommentS);
        //     self.COMMENTS=CommentS;
        // });
        //查看某一文章--通过文章题目跳转
        self.findONE = function(x) {
            $http.get('/articleofone?head='+x).then(function (resp){
                // resp.session.dataOfone=resp.data.users[0];
                window.location='http://localhost:8803/article_of_one';
            })
        };
        self.findPerson=function (x) {
            $http.get('/getPersonalMSG?author='+x).then(function (resp) {
                // self.personalArticle=resp.data;
                window.location='http://localhost:8803/PersonalCenter';
            });
        };
    }])
    .controller('articleOfONECTR',['$http','$scope',function ($http,$scope) {
        var self=this;
        $http.get('/oneArticle').then(function(resp){
            self.dataOFONE=resp.data;
            // console.log(self.dataOFONE);
        });
        $http.get('/oneComments').then(function(resp){
            self.oneComments=resp.data.reverse();
            // console.log(resp.data);
        });

    }])
    .controller('personalCTR',['$http',function ($http) {
        var self=this;
        $http.get('/personalArticles').then(function (resp) {
            self.personalArticles=resp.data.reverse();
        });
        $http.get('/personalArticlesComment').then(function (resp) {
            var CommentS=new Array();
            for (var i = 0; i < self.personalArticles.length; i++) {
                CommentS[i]=new Array();
                var k=-1;
                for (var j = 0; j < resp.data.length; j++) {
                    if(self.personalArticles[i].article_head==resp.data[j].Article){
                        k++;
                        CommentS[i][k]=resp.data[j];
                    }
                };
            };
            console.log(CommentS);
            self.personalArticlesComment=CommentS;
        });
        self.deleteArt=function(x){
            $http.get('/delPersonalArt?head='+x).then(function (resp) {
                // self.personalArticles=resp.data.reverse();
                window.location='http://localhost:8803/PersonalCenter';
            });
        }
    }]);

angular.module('mainApp',['articleApp']);

var mongoose=require('mongoose');
var ArticleSchema=mongoose.Schema({
    author:String,
    article_head:String,
    article_info:String,
    article_body:String,
    count:{type:Number,default:0},
    like:{type:Number,default:0},
});

//将该Schema发布为Model
var Article=mongoose.model('Article',ArticleSchema);

//导出模块Model
module.exports=Article;

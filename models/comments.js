var mongoose=require('mongoose');

var CommentSchema=mongoose.Schema({
    Article:{type:String},
    content:{type:String},
    preson:{type:String},
    time:{type:String},
});

//将该Schema发布为Model
var CommentS=mongoose.model('CommentS',CommentSchema);

//导出模块Model
module.exports=CommentS;

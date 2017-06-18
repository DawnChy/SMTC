var mongoose=require('mongoose');

var FollowSchema=mongoose.Schema({
    FollowAuthor:{type:String},
    Author:{type:String},
});

//将该Schema发布为Model
var Follow=mongoose.model('Comments',FollowSchema);

//导出模块Model
module.exports=Follow;

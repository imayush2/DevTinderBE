
const mongoose = require("mongoose");

const conncetionRequestSchema = new mongoose.Schema({
    fromUserId: {type:mongoose.Schema.Types.ObjectId , required : true, ref: "User"},
    toUserId : {type:mongoose.Schema.Types.ObjectId , required : true , ref: "User"},
    status: {
        type: String,
        enum : {
            values : ["interested" , "ignored" , "accepted" , "rejected"],
            message : '{VALUE} is not in status '
        },
        required: true
    },
    
}, {
	timestamps : true
});

//compound indexing 
conncetionRequestSchema.index({fromUserId : 1, toUserId : 1});

const ConnectionRequest = mongoose.model("ConnectionRequest" , conncetionRequestSchema);

module.exports = {ConnectionRequest};
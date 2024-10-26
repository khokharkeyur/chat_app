import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    profilePhoto:{
        type:String,
        default:""
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export const Group = mongoose.model('Group', groupSchema);

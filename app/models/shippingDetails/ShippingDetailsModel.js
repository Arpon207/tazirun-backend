import mongoose from 'mongoose';

const DataSchema = new mongoose.Schema(
    {
        userId:{type:mongoose.Schema.Types.ObjectId,required:true},
        cus_name:{type:String},
        cus_number:{type:String},
        alternative_number:{type:String},
        ship_area:{type:String},
        ship_thana:{type:String},
        ship_district:{type:String},
        ship_division:{type:String},
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const ShippingDetailModel = mongoose.model('shippingdetail', DataSchema);

export default ShippingDetailModel;
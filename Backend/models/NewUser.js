import mongoose from "mongoose";


const newcrudSchema = new mongoose.Schema({
    name: { type: String, required:true, trim :true},
    email: { type: String, required:true, trim :true},
    roles: { type: String, required:true, trim :true},
    
})

const CrudModel = mongoose.model("crudmodel", newcrudSchema)

export default CrudModel
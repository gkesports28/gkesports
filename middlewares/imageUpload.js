const multer  = require('multer');
const storage = multer.diskStorage({
    destination:"./public/image",
    filename:function(req,file,cb){
        const uniqueSuffix = Date.now()+"-"+Math.round(Math.random()*1E9);
        const path = 'IMG' + uniqueSuffix + "." + file.originalname.split(".")[1];
        req.image_path = path;
        cb(null,path)
    }
})
const image_upload = multer({storage:storage});
module.exports = image_upload
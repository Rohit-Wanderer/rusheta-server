const express = require('express')
const auth = require('../middleware/auth')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

const router = express.Router()


router.post("/images/upload",upload.single('image'), async (req, res) => {

    try {
        console.log(req);
        res.status(201).send({
            "message":"wabaluba",
            "path":req.file.path
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/image/download", async (req, res) => {

    console.log(req);
    
    try {
        console.log(req);
        res.download(req.body.path)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router
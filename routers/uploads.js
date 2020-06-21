const express = require('express')
const auth = require('../middleware/auth')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

const router = express.Router()


router.post("/images/upload",auth,upload.single('image'), async (req, res) => {

    try {
        console.log(req);
        res.status(201).send({
            "path":req.file.path
        })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/image/download",auth, async (req, res) => {

    console.log(req);
    
    try {
        console.log(req);
        res.download(req.body.path)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router
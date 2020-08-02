const express = require('express')
const User = require('../models/user.model')
const auth = require('../middleware/auth')
const encrypto = require('../crypto/encrypto')
const fs = require('fs');
const crypto = require('crypto');


const router = express.Router()
function RSAdecrypt(data){
    var encryptedName = data.name;
    var encryptedPhone = data.phone;
    var encryptedPassword = data.password;

    var encryptedAesKey = data.secret1;
    var encryptedIV  = data.secret2;
    
    //printing those values
    console.log("\nEncryptedName:" + encryptedName);
    console.log("\nEncryptedPhone:" + encryptedPhone);
    console.log("\nEncryptedPassword:" + encryptedPassword);


    console.log("\nEncrypted key:" + encryptedAesKey);
    console.log("\nEncrypted IV:" + encryptedIV);
    
    var privateKey = fs.readFileSync('./dec.pem', "utf8");
    var bufferForAesKey = Buffer.from(encryptedAesKey, "base64");
    var bufferForIV = Buffer.from(encryptedIV, "base64");
    var obj = {
            key: privateKey
    };
    var decryptedAes = crypto.privateDecrypt(obj, bufferForAesKey);
    var decryptedIV = crypto.privateDecrypt(obj, bufferForIV);

    var decryptedAesKeyString = decryptedAes.toString("base64");
    console.log("Decrypted AES String: " + decryptedAesKeyString);
    var bufferForAES = Buffer.from(decryptedAes, "base64");

    var decryptedIVString = decryptedIV.toString("base64");
    console.log("Decrypted IV String: " + decryptedIVString);
    var bufferForIVString = Buffer.from(decryptedIV, "base64");

//Start AES Decyption
    let encryptedNameText = Buffer.from(encryptedName, 'base64');
    let encryptedPhoneText = Buffer.from(encryptedPhone, 'base64');
    let encryptedPasswordText = Buffer.from(encryptedPassword, 'base64');


    let decipherName = crypto.createDecipheriv('aes-256-cbc', bufferForAES, bufferForIVString);
    let decryptedName = Buffer.concat([decipherName.update(encryptedNameText), decipherName.final()]);
    console.log(decryptedName.toString());

    let decipherPhone = crypto.createDecipheriv('aes-256-cbc', bufferForAES, bufferForIVString);
    let decryptedPhone = Buffer.concat([decipherPhone.update(encryptedPhoneText), decipherPhone.final()]);
    console.log(decryptedPhone.toString());

    let decipherPassword = crypto.createDecipheriv('aes-256-cbc', bufferForAES, bufferForIVString);
    let decryptedPassword = Buffer.concat([decipherPassword.update(encryptedPasswordText), decipherPassword.final()]);
    console.log(decryptedPassword.toString());


    var ret = {
        name    :   decryptedName.toString(),
        phone   :   decryptedPhone.toString(),
        password:   decryptedPassword.toString(),
        secret1 :   data.secret1,
        secret2 :   data.secret2
    };

    return ret;

}

router.post('/users', async (req, res) => {
    // Create a new user
    try {
        console.log(req.body)
        var userData = RSAdecrypt(req.body)
        const user = new User(userData)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send(user)
    } catch (error) {
        res.status(400).send(error)
        console.log(error);
    }
})

router.post('/users/login', async(req, res) => {
    //Login a registered user
    try {
        const { phone, password } = req.body
        const user = await User.findByCredentials(phone, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})



module.exports = router
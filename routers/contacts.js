const express = require("express");
const User = require("../models/user.model");
const auth = require("../middleware/auth");
const fs = require("fs");
const crypto = require("crypto");
const { restart } = require("nodemon");

const router = express.Router();

function RSAdecrypt(secret1, secret2, contacts) {
  var encryptedAesKey = secret1;
  var encryptedIV = secret2;

  var privateKey = fs.readFileSync("./dec.pem", "utf8");
  var bufferForAesKey = Buffer.from(encryptedAesKey, "base64");
  var bufferForIV = Buffer.from(encryptedIV, "base64");
  var obj = {
    key: privateKey,
  };
  var decryptedAes = crypto.privateDecrypt(obj, bufferForAesKey);
  var decryptedIV = crypto.privateDecrypt(obj, bufferForIV);

  var decryptedAesKeyString = decryptedAes.toString("base64");
  console.log("Decrypted AES String: " + decryptedAesKeyString);
  var bufferForAES = Buffer.from(decryptedAes, "base64");

  var decryptedIVString = decryptedIV.toString("base64");
  console.log("Decrypted IV String: " + decryptedIVString);
  var bufferForIVString = Buffer.from(decryptedIV, "base64");

  return contacts.map((value) => {
    let encryptedContactText = Buffer.from(value, "base64");
    let decipherContact = crypto.createDecipheriv(
      "aes-256-cbc",
      bufferForAES,
      bufferForIVString
    );
    let decryptedContact = Buffer.concat([
      decipherContact.update(encryptedContactText),
      decipherContact.final(),
    ]);
    console.log(decryptedContact.toString());
    return decryptedContact.toString();
  });
}

router.post("/contacts", auth, async (req, res) => {
  // Create a new user
  try {
    const secret1 = req.user.secret1;
    const secret2 = req.user.secret2;

    var contacts = RSAdecrypt(secret1, secret2, req.body.contacts);
    User.find(
      {
        phone: { $in: contacts },
      },
      function (err, result) {
        if (err) {
          res.status(400).send(error);
        } else {
          if (result.length != 0) {
            var ret = {
              contacts: [result[0].phone],
            };
            console.log(ret);
            res.send(ret);
          } else res.sendStatus(400);
        }
      }
    );
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/allcontacts", auth, async (req, res) => {
  try {
    User.find(function (err, result) {
      if (err) {
        res.status(400).send(error);
      } else {
        if (result.length != 0) {
          var ret = [];
          result.forEach((v) => {
            ret.push({ id: v._id, name: v.name, phone: v.phone });
          });
          console.log(ret);
          res.send(ret);
        } else res.sendStatus(400);
      }
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

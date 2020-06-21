process.env.MONGODB_URL="mongodb+srv://wanderer:sGMFOvfYp9Yixdeq@cluster0-otzlz.mongodb.net/users-db?retryWrites=true&w=majority";
process.env.MONGODB_URL="mongodb://localhost:27017";
process.env.JWT_KEY="WABALABADUBDUB"
const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
io = require('./libs/sockets').listen(server)
var bodyParser = require('body-parser')

const userRouter = require('./routers/user')
const uploadsRouter = require('./routers/uploads')
const contactsRouter = require('./routers/contacts')
const cryptoRouter = require('./crypto/encrypto')

const port = process.env.PORT= 3000;

require('./db/db')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(userRouter)
app.use(uploadsRouter)
app.use(contactsRouter)
app.use(cryptoRouter)

app.get('/', (req, res) => {
res.send('Chat Server is running on port 3000')
});

server.listen(process.env.PORT||port, () => {
    console.log("Server listening on port " + port);
});

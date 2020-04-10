process.env.MONGODB_URL="mongodb+srv://wanderer:sGMFOvfYp9Yixdeq@cluster0-otzlz.mongodb.net/users-db?retryWrites=true&w=majority";
process.env.JWT_KEY="WABALABADUBDUB"
const express = require('express'),
http = require('http'),
app = express(),
server = http.createServer(app),
io = require('socket.io').listen(server);
var bodyParser = require('body-parser');
const userRouter = require('./routers/user')
const uploadsRouter = require('./routers/uploads')
const port = process.env.PORT = 3000
require('./db/db')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(userRouter)
app.use(uploadsRouter)

app.get('/', (req, res) => {
res.send('Chat Server is running on port 3000')
});

io.on('connection', (socket) => {

    console.log('user connected')
    
    socket.on('join', function(userNickname) {
    
            console.log(userNickname +" : has joined the chat "  )
    
            socket.broadcast.emit('userjoinedthechat',userNickname +" : has joined the chat ")
        });

    socket.on('messagedetection', (senderNickname,messageContent) => {

        //log the message in console 
    
        console.log(senderNickname+" :" +messageContent)
            //create a message object
    
        let  message = {"message":messageContent, "senderNickname":senderNickname}
    
    // send the message to the client side  
    
        socket.broadcast.emit('message', message )
    
        });

    socket.on('imageDetection', (senderNickname,imagePath) => {

        //log the message in console 
    
        console.log(senderNickname+" :" +imagePath)
            //create a message object
    
        let  message = {"imagePath":imagePath, "senderNickname":senderNickname}
    
    // send the message to the client side  
    
        socket.broadcast.emit('image', message )
    
        });

        socket.on('disconnect', function() {
        console.log( 'user has left ')
        socket.broadcast.emit( "userdisconnect" ,' user has left')
    
    
    });
    
});


server.listen(process.env.PORT||port, () => {
    console.log("Server listening on port " + port);
   });

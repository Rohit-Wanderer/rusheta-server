var socketio = require('socket.io')

let phoneToSocketMap = new Map()
let socketToPhoneMap = new Map()

module.exports.listen = function(app){
    io = socketio.listen(app)

    io.on('connection', function(socket){

        console.log('user connected')
        
        socket.on('join', function(data) {        
            console.log(data +" : has joined the chat ")
            phoneToSocketMap.set(data,socket.id)
            socketToPhoneMap.set(socket.id,data)
            socket.broadcast.emit('userjoinedthechat',data +" : has joined the chat ")
        });

        socket.on('messageDetection', (senderNickname,phone,messageContent) => {

            //log the message in console 
            console.log(senderNickname+" :" +messageContent)
            //create a message object
        
            let  message = {"message":messageContent, "senderNickname":senderNickname}
        
            // send the message to the client side  
            if(phoneToSocketMap.has(phone)) 
                socket.broadcast.to(phoneToSocketMap.get(phone)).emit('message', message )
        
        });

        socket.on('imageDetection', (senderNickname,phone,imagePath) => {

            //log the message in console 
        
            console.log(senderNickname+" :" +imagePath)
            //create a message object
        
            let  message = {"imagePath":imagePath, "senderNickname":senderNickname}
        
            // send the message to the client side  
            if(phoneToSocketMap.has(phone)) 
                socket.broadcast.to(phoneToSocketMap.get(phone)).emit('image', message )
        
        });

        socket.on('disconnect', function() {
            console.log( socket.id +'user has left ')
            socket.broadcast.emit( "userdisconnect" ,' user has left')
            
            if(socketToPhoneMap.has(socket.id)){
                let phone = socketToPhoneMap.get(socket.id)
                socketToPhoneMap.delete(socket.id)
                if(phoneToSocketMap.has(phone))
                    phoneToSocketMap.delete(phone)
            } 
  
        });
        
    })

    return io
}
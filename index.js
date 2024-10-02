const express = require('express');
const Path = require('path');
const app = express();
const user = require('./database');
const Bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// socket 
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { create } = require('domain');
const io = new Server(server);

io.on('connection', (socket) => {
    // When a new user joins
    socket.on('new user', (username) => {
        socket.username = username;
        user[socket.id] = username;
        io.emit('user joined', username); // Broadcast to all users
    });

    // When a user sends a message
    socket.on('chat message', (data) => {
        io.emit('chat message', { username: data.username, message: data.message });
    });

    // When a user disconnects
    socket.on('disconnect', () => {
        if (socket.username) {
            io.emit('user left', socket.username); // Notify others
            delete user[socket.id];
        }
    });
});



app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(Path.join(__dirname,'public')));
app.set('view engine','ejs');

function Islogin(req, res, next) {
    const token = req.cookies.info;
    if (!token) {
        return res.render('login');
    }

    try {
        const data = Jwt.verify(token, "affj9");
        req.user = data;
        next();
    } catch (error) {
        return res.status(403).send("Invalid token, please login again");
    }
}


app.get('/',function(req,res) {
    res.render('create');
})
app.post('/create',async(req,res)=>{
    let user_find = await user.findOne({Email:req.body.Email});
    if(user_find) {
        return res.send("<script>alert('User account already exist'); window.location.href = '/';</script>");
    }

    Bcrypt.genSalt(10,(err,salt)=>{
        Bcrypt.hash(req.body.Password,salt,async(err,hash)=>{
            let newUser = await user.create({
                User : req.body.User,
                Email : req.body.Email,
                password : hash,
            })
            let token = Jwt.sign({Email : req.body.Email, id:req.body._id},'affj9');
            res.cookie("info",token);
            console.log(newUser);
            res.send(newUser);
        })
    })

})

app.get('/login',(req,res)=>{
    res.render('login');
})  
app.post('/login',async(req,res)=>{
    let user_find = await user.findOne({Email : req.body.Email});
    if(!user_find) {
        return res.send("<script>alert('User account not found'); window.location.href = '/';</script>");
        
    }
 Bcrypt.compare(req.body.Password,user_find.Password,(err,result)=>{
        if (err) {
            console.error(err);
            return res.status(500).send("An error occurred during login.");
        }
        if(result) {
            let token = Jwt.sign({Email : req.body.Email, id:req.body._id},'affj9');
            res.cookie("info",token);
            console.log(req.cookies.info);
            res.redirect("/inbox");
        }
        else{
            return res.send("<script>alert('Password mistake'); window.location.href = '/login';</script>");
        }
    })
})

app.get('/logout',function(req,res) {
    res.cookie('info',"");
    res.redirect('/login');
})

app.get('/inbox', Islogin, async (req, res) => {
    let New_user = await user.findOne({ Email: req.user.Email });
    res.render('index',{New_user});  
});

server.listen(3000, () => {
    console.log('listening on *:3000');
})
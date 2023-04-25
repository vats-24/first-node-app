import express from "express"
import fs from "fs"
import path from "path"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken" // we use coz in application window token generated in db was not matching 
import bcrypt from "bcrypt"

mongoose.connect("mongodb://127.0.0.1:27017",{ //here we write instead of local host time 1 49 48
    dbName:"6pack",
})
.then(()=>console.log("Database Connected"))
.catch((e)=>console.log(e));

/*const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
});

const Messge = mongoose.model("Message",messageSchema)*/

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String,
})

const User = mongoose.model("user",userSchema)


const app = express();  // thats how server is created

//const users = [];


/*Setting up view engine its deafult like this only
sole purpose to use this to  as dynamic data not static data*/
app.set("view engine", "ejs");
/* then how to use static file we'll use express static then we will create a middleware to acces the static file 
directly we will use path operation to join the required path and will acces using app.use we will make a public folder
which we will disclose publicly for eg just the frontend part and not the backend js it will always point towards the static folder
 */


//using middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

const isAuthenticated = async (req,res,next) => {
    const { token } = req.cookies;
    if(token){

        const decoded = jwt.verify(token,"jsnkanijerinkd")

        //console.log(decoded)

        req.User = await User.findById(decoded._id)

        next() //jump from one middleware to another all are the a]same thing isAuth is middleware
    }
    else {
        //res.render("login")
        res.redirect("/login")
    }
}





app.get("/",isAuthenticated,(req,res,next)=>{  // this is an api we have created---handler we can create infinite (req,res)=>{next()},(req,res)=>{next()});
   /* res.send("HIdndfefkasnfk");
     res.sendStatus(404) - gives not found
     res.json({
         success:true,
         products:[],
     })
     what if we dont have any framework we can then render html itself
     res.statusCode(400).send("Meri Marzi") we can do chaining and send it like this
     res.sendFile("./index.html") we cant do it like this we have to use fs give error like give absolute path
     res.send(fs.readFileSync("./index.html")) it shows error string varible so well use path module
     to get path
     console.log(path.resolve());
     res.sendFile("./index.html")*/
     //res.render("index",{name:"nooooooooor"});
     //res.sendFile("index.html");
    //  console.log(req.cookies);
    /*const {token} = req.cookies;

    if(token){
        res.render("logout")
    }
    else{
        res.render("login")
    } */
    //console.log(req.User); we can access this
    res.render("logout",{name: req.User.name}) // we can pass the name like this 
});





app.post("/register",async (req,res,next) =>{
    //console.log(req.body);

    const {name,email,password} = req.body  // we have destructured it

    let user = await User.findOne({email}) // if user doesnt exist
    
    if(user)
    {
        // return console.log("Register First") -- infinitely login
        return res.redirect("/login")// user nhi mila db mei toh register pr pahoch jao
    }

    const hashedPassword = await bcrypt.hash(password,10)

     user = await User.create({
        name:name,
        email:email,
        password: hashedPassword,
    });

    const token = jwt.sign({_id:user._id},"jsnkanijerinkd")
    //console.log(token);


    res.cookie("token",token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60*1000),
    });
    res.redirect("/")
})

app.get("/register",(req,res,next)=>{ 
    res.render("register")
 });

 app.get("/login",(req,res,next)=>{ 
    res.render("login")
 });

 app.post("/login", async (req,res,next)=>{
    const {email,password} = req.body

    let user = await User.findOne({email})

    if(!user) return res.redirect("/register")

    //const isMatch = user.password===password;

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch) return res.render("login",{email, message: "Incorrect Password"})

    const token = jwt.sign({_id:user._id},"jsnkanijerinkd")
    //console.log(token);


    res.cookie("token",token,{
        httpOnly: true,
        expires: new Date(Date.now() + 60*1000),
    });
    res.redirect("/")
 })

app.get("/logout",(req,res,next) =>{
    res.cookie("token",null,{
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/")
})


/*app.get("/success",(req,res,next) =>{
    //res.send("HEMLOOOO")
    res.render("success")
})

app.get("/add", async (req,res,next) =>{
    await Messge.create({name:"Vats1",email:"sample2@gmail.com"});
    res.send("Nice")
})*/

/*app.get("/users",(req,res,next) =>{
    res.json({
        users,
    });// this will send json respond and direct the users array 
})*/
/*we will now make post for form submission*/ 
/*app.post("/contact",async (req,res,next) => {
    // console.log(req.body);
    //users.push({username: req.body.name, email: req.body.email});// user array k andr vhla gya lkin restart krne pr udd jaega
    //res.render("success"); // after submitting it will redirect here
    // const messageData = {username: req.body.name, email: req.body.email};
    // console.log(messageData);

    /*we can write like this or we can write by destructuring it like this:
    const {name,email} = req.body
    await Messge.create({name:name,email:email}); this is more clear compared to below if key value pair has same name
    await Messge.create({name: req.body.name, email: req.body.email});
    res.redirect("/success")
})*/


app.listen(5000, () => {
    console.log("Server is working");

})




// from req.url we can access any url we need
// req.method we can access any method
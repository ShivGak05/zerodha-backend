require('dotenv').config();
const express=require("express");
const mongoose=require("mongoose");
const bodyParser=require('body-parser')
const cors=require('cors')
const {HoldingsModel}=require('./models/HoldingsModel')
const {PositionModel}=require('./models/PositionModel')
const {OrdersModel}=require('./models/OrdersModel')
const PORT=process.env.PORT || 3002;
const url=process.env.MONGO_URL;
const cookieParser=require('cookie-parser');
const jwt = require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const {UserModel}=require('./models/UserModel');
const { createSecretToken } = require('./SecretToken');
mongoose.connect(url).then(()=>{
    console.log("Database connected!")
});
const app=express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
//---------------------------------Dummy data------------------------//
// app.get('/addHoldings',async(req,res)=>{
//     let tempHoldings=[
//         {
//     name: "BHARTIARTL",
//     qty: 2,
//     avg: 538.05,
//     price: 541.15,
//     net: "+0.58%",
//     day: "+2.99%",
//   },
//   {
//     name: "HDFCBANK",
//     qty: 2,
//     avg: 1383.4,
//     price: 1522.35,
//     net: "+10.04%",
//     day: "+0.11%",
//   },
//   {
//     name: "HINDUNILVR",
//     qty: 1,
//     avg: 2335.85,
//     price: 2417.4,
//     net: "+3.49%",
//     day: "+0.21%",
//   },
//   {
//     name: "INFY",
//     qty: 1,
//     avg: 1350.5,
//     price: 1555.45,
//     net: "+15.18%",
//     day: "-1.60%",
//     isLoss: true,
//   },
//   {
//     name: "ITC",
//     qty: 5,
//     avg: 202.0,
//     price: 207.9,
//     net: "+2.92%",
//     day: "+0.80%",
//   },
//   {
//     name: "KPITTECH",
//     qty: 5,
//     avg: 250.3,
//     price: 266.45,
//     net: "+6.45%",
//     day: "+3.54%",
//   },
//   {
//     name: "M&M",
//     qty: 2,
//     avg: 809.9,
//     price: 779.8,
//     net: "-3.72%",
//     day: "-0.01%",
//     isLoss: true,
//   },
//   {
//     name: "RELIANCE",
//     qty: 1,
//     avg: 2193.7,
//     price: 2112.4,
//     net: "-3.71%",
//     day: "+1.44%",
//   },
//   {
//     name: "SBIN",
//     qty: 4,
//     avg: 324.35,
//     price: 430.2,
//     net: "+32.63%",
//     day: "-0.34%",
//     isLoss: true,
//   },
//   {
//     name: "SGBMAY29",
//     qty: 2,
//     avg: 4727.0,
//     price: 4719.0,
//     net: "-0.17%",
//     day: "+0.15%",
//   },
//   {
//     name: "TATAPOWER",
//     qty: 5,
//     avg: 104.2,
//     price: 124.15,
//     net: "+19.15%",
//     day: "-0.24%",
//     isLoss: true,
//   },
//   {
//     name: "TCS",
//     qty: 1,
//     avg: 3041.7,
//     price: 3194.8,
//     net: "+5.03%",
//     day: "-0.25%",
//     isLoss: true,
//   },
//   {
//     name: "WIPRO",
//     qty: 4,
//     avg: 489.3,
//     price: 577.75,
//     net: "+18.08%",
//     day: "+0.32%",
//   },
// ];
//     tempHoldings.forEach((item)=>{
//         let newdata=new HoldingsModel(item);
//         newdata.save()
// });
// res.send("done!");
// })

// app.get('/addPositions',async(req,res)=>{
//     let tempPositions=[
//           {
//     product: "CNC",
//     name: "EVEREADY",
//     qty: 2,
//     avg: 316.27,
//     price: 312.35,
//     net: "+0.58%",
//     day: "-1.24%",
//     isLoss: true,
//   },
//   {
//     product: "CNC",
//     name: "JUBLFOOD",
//     qty: 1,
//     avg: 3124.75,
//     price: 3082.65,
//     net: "+10.04%",
//     day: "-1.35%",
//     isLoss: true,
//   },
//     ]
//     tempPositions.forEach((item)=>{
//         let newpos=PositionModel(item);
//         newpos.save();
//     })
//     res.send("Done!");
// })

app.get("/me", async (req, res) => {
    console.log("Me route hit!")
  try {

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const user = await UserModel.findById(decoded.id);

    res.json({
      username: user.username,
      email: user.email
    });

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }

});

app.post("/signup",async(req,res)=>{
    const {email,password,username}=req.body;
    const findUser=await UserModel.findOne({email});
    if(findUser){
        return res.json({message:"User already exists!"});
    }
    const hashedpasswd=await bcrypt.hash(password,10);
    let newuser=await UserModel.create({email,username,password:hashedpasswd});
    const token=createSecretToken(newuser._id);
    res.cookie("token",token,{
        withCredentials:true,
        httpOnly:false,
    })
    res.status(201).json({message:"User signed in successfully",success:true,newuser});
})


app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    console.log("Email:", email);
    console.log("Password from body:", password);

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    console.log("User from DB:", user);
    console.log("User password:", user?.password);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password!"
      });
    }

    const token = createSecretToken(user._id);

   res.cookie("token", token, {
  httpOnly: true,
  sameSite: "lax"
});

    res.status(200).json({
      message: "Login successful!",
      success: true,
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});

app.get('/allHoldings',async(req,res)=>{
    let allHoldings=await HoldingsModel.find({});
    res.json(allHoldings);
});

app.get('/allPositions',async(req,res)=>{
  let allpos=await PositionModel.find({});
  res.json(allpos);
})

app.post('/newOrder',async(req,res)=>{
    let newdata=new OrdersModel({
        name:req.body.name,
        qty:req.body.qty,
        price:req.body.price,
        mode:req.body.mode,
    });
    if(req.body.mode=="SELL"){
        if(req.body.qty<=0) return;
    }

    let newholding=new HoldingsModel({
            name:req.body.name,
            qty:req.body.qty,
            avg:234.6,
            price:req.body.price,
            net:"2.6%",
            day:"-0.87%",
    });
    newdata.save();
    newholding.save(); 
    res.send("Done!");
})

app.get('/allOrders',async(req,res)=>{
    let allOrders=await OrdersModel.find({});
    res.json(allOrders);
})

app.listen(PORT,()=>{
    console.log("Server is listening on port 3002!")
})
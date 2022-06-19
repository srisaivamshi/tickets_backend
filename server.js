const mongoClient = require("mongodb").MongoClient;
const next = require("next");
const express = require("express");
const app = express();
const cors = require("cors");
const fs=require("fs");
const path=require("path")
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(express.static("public"));
//mongodb+srv://srisaivamshi:Vamshi1@cluster0.zcdcx.mongodb.net/?retryWrites=true&w=majority
var db; 
mongoClient.connect("mongodb+srv://srisaivamshi:Vamshi1@cluster0.zcdcx.mongodb.net/?retryWrites=true&w=majority", (err, client) => {
  if (err) { 
    console.log("Error");
  } else {
    db = client.db("EmployeeDB");   
  }
});


// app.get("/",(req,res)=>{
//   console.log("yes came"+__dirname);
//   res.sendFile(path.join(__dirname+"/public"));
// })

app.post("/admin/AddNewItem", (req, res) => { 
  db.collection("employees").insertOne({
    Title: req.body.Title,
    Director: req.body.Director,
    Price: req.body.Price,
    Img: req.body.Img,
    Count: req.body.Count,
    Favourite: req.body.Favourite,
  });
  console.log("inserted successfully");
  res.end();
}); 


function AddToCart(req){
  if(db.collection("Cart").find({Title:req.Title,user:req.user}).toArray((err,result)=>{
    if(result.length==0){
    db.collection("Cart").insertOne({
      Title: req.Title,
      Img: req.Img,
      Price: req.Price,
      Count: req.Count,
      user:req.user
    }); 
  }
  else {console.log("Already added to cart")}
  }));
}



app.post("/MainPage", (req, res) => {
  if(req.body.where==='wishList'){
    db.collection("wishList").insertOne({
      Title: req.body.Title,
      Img: req.body.Img,
      Count:req.body.Count,
      Price:req.body.Price,
      user:req.body.user
    });
  }
  else AddToCart(req.body)
  res.send();
});



app.post("/register", (req, res) => {
  db.collection("LoginCredentials").find({Email:req.body.Email}).toArray((err, result) =>{
    if (err) {}
    if(result.length==0) {
      db.collection("LoginCredentials").insertOne({
        Email: req.body.Email,
        UserName: req.body.UserName,
        Phone: req.body.Phone,
        Password: req.body.Password,
        Address:req.body.Address,
        College:req.body.College
      });
     res.send(true);
     console.log("newly added user");
    }
    else {
      // console.log("user already registered");
      res.send(false);}
  });
});


app.post("/user",(req,res)=>{
  db.collection("session").updateMany({},{$set:{name:req.body.UserName}});
})


app.post("/login",(req,res)=>{
  db.collection("LoginCredentials").find({UserName:req.body.UserName,Password:req.body.Password}).toArray((err,items)=>{
    if(err){
    }
    res.send(items);
  });
});
  
app.post("/wishlist",(req,res)=>{
  AddToCart(req.body);
})

app.get("/admin", (req, res) => {
  db.collection("employees").find().toArray((err, items) => {
      if (err) {
      }
      res.send(items);
    });
});


app.get("/user", (req, res) => {
  db.collection("session").find().toArray((err, items) => {
      if (err) {
      }
      res.send(items);
    });
});

app.get("/loginer/:id", (req, res) => {
  db.collection("LoginCredentials").find({UserName:req.params.id}).toArray((err, items) => {
      if (err) {
      }
      res.send(items);
    });
});


app.get("/Movie/:id", (req, res) => {
  // console.log(req.params.id);
  db.collection("employees").find({Title:req.params.id}).toArray((err, items) => {
      if (err) {
      }
      res.send(items);
    });
});

app.get("/cart/:id", (req, res) => {
  db.collection("Cart").find({user:req.params.id}).toArray((err, items) => {
      if (err) {
      }
      res.send(items);
    });
});


app.get("/wishlist/:id", (req, res) => {
  db.collection("wishList").find({user:req.params.id}).toArray((err, items) => {
      if (err) {
      }
      res.send(items);
    });
});


app.get("/Admins/:id",(req,res)=>{
  db.collection("Admins").find({AdminName:req.params.id}).toArray((err, result) =>{
    if (err) {}
    if(result.length==0) {
     res.send(false);
    //  console.log("newly added user"); 
    }
    else {
      // console.log("user already registered");
      res.send(true);}
  });
})


app.delete("/admin/:id", (req, res) => {
  db.collection("employees").deleteOne({ Title: req.params.id });
  db.collection("wishList").deleteMany({Title:req.params.id});
  db.collection("Cart").deleteMany({ Title: req.params.id });
  console.log("deleted");
});


app.delete("/MainPage/:id",(req,res)=>{
  db.collection("wishList").deleteOne({Title:req.params.id,user:req.body.user});
})
  


app.delete("/cart/:id", (req, res) => {
  db.collection("Cart").deleteOne({ Title: req.params.id ,user:req.body.user});
  console.log("deleted");
});


app.delete("/wishlist/:id",(req,res)=>{
  db.collection("wishList").deleteOne({Title:req.params.id,user:req.body.user});
  db.collection("employees").updateOne(
    { Title: req.params.id },
    {
      $set: {
        Favourite: false,
      },
    }
  );
})


app.put("/admin/updateItem/:id", (req, res) => {
  db.collection("employees").updateOne(
    { Title: req.params.id },
    {
      $set: {
        Title: req.body.Title,
        Director: req.body.Director,
        Price: req.body.Price,
        Img: req.body.Img,
        Count: req.body.Count,
        Favourite: req.body.Favourite,
      },
    }
  );

  db.collection("Cart").updateMany(
    { Title: req.params.id },
    {
      $set: {
        Title: req.body.Title,
        Price: req.body.Price,
        Img: req.body.Img,
        Count: req.body.Count,
      },
    }
  ); 

  db.collection("wishList").updateMany(
    { Title: req.params.id },
    {
      $set: {
        Title: req.body.Title,
        Price: req.body.Price,
        Img: req.body.Img,
        Count: req.body.Count,
      },
    }
  ); 
  console.log("updated");
});


app.put("/logoutUser",(req, res)=>{
  db.collection("session").updateOne({},{
    $set:{
      name:"Login"
    }
  })
}
)



app.put("/cart/:id", (req, res) => {
  console.log(req.params.id);
  let val = parseInt(req.body.Count) + parseInt(req.body.Delimiter);
  db.collection("Cart").updateOne(
    { Title: req.params.id ,user:req.body.user},
    {
      $set: {
        Count: val,
      },
    }
  );
});  


app.put("/MainPage/:id", (req, res) => {
  let val = req.body.Favourite==="true"? "false" : "true";
  db.collection("employees").updateOne(
    { Title: req.params.id },
    {
      $set: {
        Favourite: !req.body.Favourite,
      },
    }
  );
});


// app.get("/Yes",(req,res)=>{ 
//   res.send("HIII i am the servere");
// })

const port=process.env.PORT||5000;

app.listen(port, function () {
  console.log("The server is running at port number 5000");
});
 
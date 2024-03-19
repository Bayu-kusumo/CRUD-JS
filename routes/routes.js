const express = require('express');
const router = express.Router();
const User =  require('../models/user');
const multer = require('multer');
const fs = require('fs');

// IMage upload
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads')
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname+"_"+ Date.now()+"_"+file.originalname);
    },
});

var upload = multer({
    storage: storage,
}).single('image');

// insert an users into database route
router.post('/add', upload, async (req,res)=>{
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });
        await user.save();
            req.session.message = {
                type: 'success',
                message: 'User added successfully!'
            }
        } catch (error) {
        res.json({message: error.message, type: 'danger'});
        }
        res.redirect('/');
    });

    //get all user route
//render hanya bisa digunakan untuk membaca file dengan extensi ejs
router.get('/', async (req,res)=>{
    //res render digunakan untuk membuka file dalam bentuk ejs, kemudian index tersebut merupakan file yang dibuka
    try {
        const users = await User.find(). exec();
        res.render('index',{
            title: 'Home Page',
            users: users,
        });
    } catch (error) {
        res.json({
            message: err.message
        });
    };
});

// Edit an user
router.get('/edit/:id',async (req,res)=>{
    let id = req.params.id;
    const user = await User.findById(id);
        if(user == null){
            res.redirect('/');
        } else {
            res.render('edit_users',  {
                title: 'Edit User',
                user: user
            });
        }
    }
);

//update User route
router.post('/update/:id', upload, async (req,res, next)=>{
    let id = req.params.id.trim();
    let new_image = '';

    if(req.file){
        new_image = req.file.filename;
    try{
        fs.unlinkSync('./uploads/'+req.body.old_image);
    } catch(error){
        console.log(error);
    }   
} else {
    new_image = req.body.old_image;
}

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image
    });
    req.session.message = {
        type: 'success',
        message: 'User Update succesfully!',
    };
    res.redirect('/');
    } catch (error) {
        console.log(error);
        req.session.message = {
            type: 'failed',
            message: 'User update failed'
    } 
    res.redirect('/');
    if(err){
        console.log(err);
    }
}
});


//Delete user
router.get('/delete/:id',async (req,res)=>{
    let id = req.params.id;
    try {
        await User.findByIdAndDelete(id);
            req.session.message = {
                type: 'success',
                message: 'User delete succesfully!'}
    } catch (error) {
        console.log(error);
    }
    res.redirect('/');
});



router.get('/add', (req,res)=>{
    res.render('add_users', { title: 'Add Users' })
});

module.exports= router;
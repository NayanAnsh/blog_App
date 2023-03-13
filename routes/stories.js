const express = require('express')
const router = express.Router()
const {ensureAuth} = require('../middleware/auth')
const Story = require("../models/story")
//@desc Show add page
//@route GET /stories/add
router.get('/add',(req,res)=>{
    res.render('stories/add')

})
//@desc Process add form
//@route POST /stories
router.post('/', async(req,res)=>{
    
    try {
        req.body.user =  req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
            console.error(error)
            res.render('error/500')
    }

})
//@desc show all stories
//@route GET /stories/
router.get('/',ensureAuth,async (req,res)=>{
        try {
            const stories = await Story.find({status :'public'})
            .populate('user')
            .sort({createdAt:'desc'})
            .lean()
            // console.log(stories)         
            res.render('stories/index',{
                stories
            }) 
        } catch (error) {
            console.error(error)
            res.render('error/500')
        }
})
router.get("/edit/:id" ,  ensureAuth, async (req,res)=>{
    const story = await Story.findOne({
        _id:req.params.id
    }).lean()
  //  console.log("++++"+story.user)
    //console.log("----"+req.user.id)
    if(!story){
        return res.render('error/404')

    }
    res.render("stories/edit",{
        story
    })

})
//@desc Show story page
//@route GET /stories/:id
router.get('/:id',async (req,res)=>{
   try {
    let story = await Story.findById(req.params.id)
    .populate('user')
    .lean()
    if(!story){
        return res.render('error/404')
    }
    res.render("stories/show",{
        story
    })
   } catch (error) {
        console.log(error)
        res.render("error/404")
   }

})
//@desc show user storis
//@route GET /stories/user/:id
router.get('/user/:userid', async(req,res)=>{
    try {
        const stories =  await Story.find({
            user : req.params.userid,
            status:"public"
        }).populate("user").lean()
        res.render("stories/index",{
            stories
        });
    } catch (error) {
        console.error(error)
        res.render("error/500")
    }

})
//@desc Show update story
//@route PUT /stories/:id
router.put('/:id', async (req,res)=>{
    let story =  await Story.findById(req.params.id).lean()
    if(!story){
        return res.render('error/404')
    }
    
    
    
    if(story.user.equals(req.user.id)){
        story =  await Story.findOneAndUpdate({_id : req.params.id},req.body,{
            new:true,
            runValidators:true
        })
        res.redirect("/stories")  
    }else{
        res.redirect("/dashboard");
    }
  
})
//@desc delete story
//@route deete /stories/:id
router.delete('/:id', async (req,res)=>{
    try{
        await Story.deleteOne({_id: req.params.id})
        res.redirect("/dashboard")
    }catch(err){
        console.log(err);
        return res.render("error/500");
    }

})

module.exports = router;
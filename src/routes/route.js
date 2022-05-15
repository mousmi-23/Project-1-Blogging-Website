const express = require('express');
const router = express.Router();

/********************************Require controller modules******************************************** */ 
const authorController = require("../controllers/authorController")
const blogController = require("../controllers/blogController")
const middleware = require("../middleware/auth")


router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

//**************************************AUTHOR API's**************************************************** */

router.post('/authors', authorController.createAuthor)
router.post('/login', authorController.loginAuthor)

//*****************************************BLOG API's**************************************************** */

router.post('/blogs',middleware.authenticate,middleware.authorise, blogController.createBlog)
router.get('/blogs',middleware.authenticate, blogController.getBlog)
router.put('/blogs/:blogId',middleware.authenticate, middleware.authorisation, blogController.updateBlog)   
router.delete('/blogs/:blogId',middleware.authenticate, middleware.authorisation, blogController.deleteBlogs)
router.delete('/blogs',middleware.authenticate, blogController.deletedBlogsByParams)



module.exports= router;
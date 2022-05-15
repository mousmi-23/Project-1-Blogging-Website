const jwt = require("jsonwebtoken");
const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")


//***************************************AUTHENTICATION************************************************** */

const authenticate = function (req, res, next) {
    try {
        let token = req.headers["x-api-token"];
        if (!token) {
            return res.status(404).send({ status: false, message: "Token must be present" })
        }
        jwt.verify(token, 'appleShine', async (err, decodedToken) => {
            if (err) {
                return res.status(401).send({ status: false, message: err.message })
            }
            const userRes = await authorModel.findById(decodedToken.authorId)
            req.decodedToken = decodedToken// dont't want to kill request means still want to use decoded token
            if (!userRes) {
                return res.status(401).send({ status: false, message: "You are unauthenticated,please register your account" })
            }
            next()
        })
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}


//*****************************************AUTHORIZATION**************************************************** */

const authorise = function (req, res, next) {
    try {
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, message: "Please provide Details" })
        }
        if (req.body.authorId === undefined) {
            return res.status(400).send({ status: false, message: "AuthorId is required" })
        }
        let authortobemodified = req.body.authorId

        let decodedToken = req.decodedToken//syntax need to write in reverse order
        let authorloggedin = decodedToken.authorId
        if (authortobemodified != authorloggedin) {
            return res.status(400).send({ status: false, message: "Loggedin person is not allow to create data" })
        }
        next()
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

const authorisation = async function (req, res, next) {
    try {
        let blogId = req.params.blogId
        let findBlog = await blogModel.findById(blogId)
        if (!findBlog) {
            return res.status(404).send({ status: false, message: "Blog not found" })
        }
        let authortobemodified = findBlog.authorId
        let token = req.headers["x-api-token"];
        let decodedtoken = jwt.verify(token, "appleShine")
        let userloggedin = decodedtoken.authorId

        if (authortobemodified != userloggedin) {
            return res.status(403).send({ status: false, message: "User is not allowed to modify other's blog" })//forbidden
        }
        next()
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


//************************************EXPORTING BOTH MIDDLEWARE FUNCTIONS****************************** */

module.exports.authenticate = authenticate
module.exports.authorise = authorise
module.exports.authorisation = authorisation
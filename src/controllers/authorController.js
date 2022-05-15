const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken");


//***************************************************VALIDATION FUNCTIONS************************************************************ */

const isValid = function (value) {
    if (typeof (value) === 'undefined' || typeof (value) === 'null') { return false }
    if (typeof (value) === 'String'  && value.trim().length === 0) { return false }
    return true;
}


const isValidTitle = function (title) {
    return ["Mr", "Mrs", "Miss"].indexOf(title.trim()) !== -1
}


//*****************************************************REGISTER NEW AUTHOR************************************************************ */

const createAuthor = async function (req, res) {
    try {
        let data = req.body;

        if (Object.keys(req.body)== 0) {
            return res.status(400).send({ status: false, msg: "Please Provide Author Details" })
        }

        const { fname, lname, title, email, password } = data

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: 'First name is required'})
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: 'Last name is required'})
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required'})
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: 'Email is required'})
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'Password is required'})
        }

        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: `${title} title is not valid` })
        }

        if (!(/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email.trim()))) {
            return res.status(400).send({ status: false, message: `${email.trim()} email is not valid` })
        }

        if (password.trim().length < 3 || password.trim().length > 16) {
            return res.status(400).send({ status: false, message: "Password should be 3 to 16 characters" })
        }

        const isEmailAlreadyUsed = await authorModel.findOne({ email : email.trim() });
        
        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, message: `${email.trim()} email address is already registered` })
        }

        const authorData = {
            fname: fname.trim(),
            lname: lname.trim(),
            email: email.trim().toLowerCase(),
            password: password.trim(),
          };
      
        let dataRes = await authorModel.create(authorData)
        return res.status(201).send({ status: true, message: 'Author created successfully', data: dataRes })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


/******************************************************AUTHOR LOGIN******************************************************* */

const loginAuthor = async function (req, res) {
    try {
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, message: "Please Provide login Details" })
        }

        const { email, password } = req.body

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email Is Required" })
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password Is Required" })
        }

        let authorEmail = await authorModel.findOne({ email: email })
        let authorPassword = await authorModel.findOne({ password: password })

        if (authorEmail && authorPassword) {
            const generatedToken = jwt.sign({
                authorId: authorEmail._id,
                email: email,
            }, "appleShine", { expiresIn: "1h" })

            res.header('x-api-token', generatedToken)
            return res.status(200).send({ status: true, message: 'Author login successfully', token: generatedToken })
        } else {
            if (!authorEmail) {
                return res.status(404).send({ status: false, message: "Invalid Email" })
            }
            else if (!authorPassword) {
                return res.status(404).send({ status: false, message: "Invalid password" })
            }
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


//**************************************EXPORTING AUTHOR'S HANDLERS********************************************* */

module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor
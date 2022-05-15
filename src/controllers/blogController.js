const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")
const mongoose = require('mongoose');
const { findById } = require("../models/authorModel");

//**************************************VALIDATION FUNCTIONS************************************************* */

const isValid = (value) => {
    if (typeof (value) === 'undefined' || typeof (value) === 'null') { return false }
    if (typeof (value) === 'String' && value.trim().length === 0) { return false }
    return true;
}

const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValidRequestBody = (requestBody) => {
    return Object.keys(requestBody).length > 0
}


//******************************************CREATE BLOG******************************************************* */

const createBlog = async function (req, res) {
    try {
        let data = req.body

        const { title, body, authorId, tags, category, subcategory } = data

        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, message: "Please provide Blog details" })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Blog Title is required' })
        }

        if (!isValid(body)) {
            return res.status(400).send({ status: false, message: 'Blog Body is required' })
        }

        if (!isValid(authorId)) {
            return res.status(400).send({ status: false, message: 'Author Id is required' })
        }

        if (!isValid(tags)) {
            return res.status(400).send({ status: false, message: "Tags is required" })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: 'Blog Category is Required' })
        }

        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "SubCategory is required" })
        }

        if (!isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, message: `${authorId} is not a valid author Id` })
        }

        let isPublished = req.body.isPublished
        if (isPublished === true) {
            data["publishedAt"] = new Date()
        }

        const idData = await authorModel.findById(authorId)
        if (!idData) {
            return res.status(404).send({ status: false, message: "Author does not exist" })
        }
        const savedData = await blogModel.create(data)
        return res.status(201).send({ status: true, message: 'New blog created successfully', result: savedData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//***************************************ALL BLOGS & FILTERED BLOGS************************************************* */

const getBlog = async function (req, res) {
    try {
        let queryParams = req.query
        const keys = Object.keys(queryParams)

        const requiredQueryParams = ['authorId', 'category', 'tags', 'subcategory'];
        for (let i = 0; i < keys.length; i++) {
            if (!requiredQueryParams.includes(keys[i])) {
                return res.status(400).send({
                    status: false,
                    message: `Only these body params are allowed ${requiredQueryParams.join(", ")}`
                });
            }
        }

        const filterQuery = { isDeleted: false, deletedAt: null, isPublished: true }

        if (isValidRequestBody(queryParams)) {
            const { authorId, category, tags, subcategory } = queryParams

            if (authorId) {
                if (!isValidObjectId(authorId)) {
                    return res.status(400).send({ status: false, message: `${authorId} is not a valid author Id` })
                }
            }

            if (isValid(authorId)) {
                filterQuery["authorId"] = authorId.trim()
            }

            if (isValid(category)) {
                filterQuery['category'] = category.trim()
            }

            if (isValid(tags)) {
                const tagsArr = tags.trim().split(',').map(tag => tag.trim());
                filterQuery['tags'] = { $all: tagsArr }
            }

            if (isValid(subcategory)) {
                const subcatArr = subcategory.trim().split(',').map(subcategory => subcategory.trim());
                filterQuery['subcategory'] = { $all: subcatArr }
            }
        }

        const blogs = await blogModel.find(filterQuery)
        if (blogs.length === 0) {
            return res.status(404).send({ status: false, message: "No Blogs Found" })
        }
        res.status(200).send({ status: true, message: 'Blogs List', Count: blogs.length, Data: blogs })
    }
    catch (err) {
        res.status(500).send({ Status: false, error: err.message })
    }
}


//**********************************************UPDATING A BLOG***************************************************** */

const updateBlog = async function (req, res) {
    try {
        let blogid = req.params.blogId
        let check = await blogModel.findById(blogid)
        if (!check) { return res.send({ status: false, message: 'Not valid id' }) }

        let checking = check.isDeleted
        if (checking == true) { return res.status(404).send({ status: false, message: "Blog has been already deleted" }) }
        let update = await blogModel.findOneAndUpdate({ _id: blogid }, { $set: { isPublished: true, publishedAt: new Date() } }, { new: true })

        const { title, body, tags, category, subcategory } = req.body
        const updateBlogData = {}

        if (isValid(title)) {
            updateBlogData['title'] = title
        }

        if (isValid(body)) {
            updateBlogData['body'] = body
        }

        if (isValid(category)) {
            updateBlogData['category'] = category
        }

        if (isValid(tags)) {
            if (Array.isArray(tags)) {
                let newTag = check.tags
                for (let i = 0; i < tags.length; i++) {
                    if (typeof tags[i] === "string") {

                        if (!newTag.includes(tags[i])) {
                            newTag.push(tags[i])
                        }

                    } else {
                        return res.status(400).send({ status: false, message: "Tags can be only in string" })
                    }
                }
                updateBlogData.tags = newTag
            }
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                let newSubcategory = check.subcategory
                subcategory.filter((ele) => (typeof ele === "string" && newSubcategory.indexOf(ele) == -1) ? newSubcategory.push(ele) : ele)

                updateBlogData.subcategory = newSubcategory
            }
        }
        let updatedBlog = await blogModel.findOneAndUpdate({ _id: blogid }, updateBlogData, { new: true })
        return res.status(200).send({ status: true, message: "Update Blog Successfully", data: updatedBlog });
    } catch (err) {
        return res.status(500).send({ status: false, error: err.mesage })
    }
}


//***************************************DELETING AN INDIVIDUAL BLOG**************************************************** */

const deleteBlogs = async function (req, res) {
    try {
        let id = req.params.blogId
        let data = await blogModel.findById(id)
        if (data) {
            if (data.isDeleted == false) {
                let deleteData = await blogModel.findOneAndUpdate({ _id: id }, { isDeleted: true, deleteAt: new Date() }, { new: true })
                return res.status(200).send({ status: true, message: "Blog deleted Successfully", data: deleteData })
            }
            else {
                return res.status(200).send({ status: true, message: "Data already deleted" })
            }
        } else {
            return res.status(404).send({ status: false, message: "Id does not exist" })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.massage })
    }
}


//******************************************DELETING MULTIPLE BLOGS OF SAME AUTHOR****************************************************** */

const deletedBlogsByParams = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false, deleteAt: null }
        const queryParams = req.query

        let keys = Object.keys(queryParams);
        for (let i = 0; i < keys.length; i++) {
            if (!(queryParams[keys[i]])) { return res.status(400).send({ status: false, message: "Please provide proper filters" }) }
        }

        if (!isValidRequestBody(queryParams)) {
            return res.status(400).send({ status: false, message: 'No query params received ' })
        }

        const { authorId, category, tags, subcategory, isPublished } = queryParams

        if (authorId) {
            if (!isValidObjectId(authorId)) {
                return res.status(400).send({ status: false, message: `${authorId} is not a valid author Id` })
            }
        }
        if (isValid(authorId)) {
            filterQuery['authorId'] = authorId
        }

        if (isValid(category)) {
            filterQuery['category'] = category.trim()
        }

        if (isValid(isPublished)) {
            filterQuery['isPublished'] = isPublished
        }

        if (isValid(tags)) {
            const tagsArr = tags.trim().split(',').map(tag => tag.trim());
            filterQuery['tags'] = { $all: tagsArr }
        }

        if (isValid(subcategory)) {
            const subcatArr = subcategory.trim().split(',').map(subcategory => subcategory.trim());
            filterQuery['subcategory'] = { $all: subcatArr }
        }

        const blogs = await blogModel.find(filterQuery)

        if (blogs.length === 0) {
            return res.status(404).send({ status: false, message: "No Blogs Found" })
        }

        await blogModel.updateMany(filterQuery, { $set: { isDeleted: true, deleteAt: new Date() } }, { new: true })
        return res.status(200).send({ status: true, message: 'Blogs Deleted Successfully' });

    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


//********************************************EXPORTING ALL BLOG'S HANDLERS********************************************** */

module.exports.createBlog = createBlog;
module.exports.getBlog = getBlog;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlogs = deleteBlogs;
module.exports.deletedBlogsByParams = deletedBlogsByParams;
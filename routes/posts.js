const router = require("express").Router()
const Post = require("../models/Post")
const User = require("../models/User")

//create a post
router.post("/", async (req, res) => {
    try {
        const newPost = new Post(req.body)
        const post = await newPost.save()
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
})
//update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(post.userId === req.body.userId) {
            await post.updateOne({$set:req.body})
            res.status(200).json("Post updated succesfully.")
        } else {
            res.status(401).json("You can only update your post.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})
//delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(post.userId === req.body.userId) {
            await post.deleteOne()
            res.status(200).json("Post deleted succesfully.")
        } else {
            res.status(401).json("You can only delete your post.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})
//like a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push:{likes:req.body.userId}})
            res.status(200).json("Post liked.")
        } else {
            await post.updateOne({$pull:{likes:req.body.userId}})
            res.status(200).json("Post unliked.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})
//get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) {
            return res.status(404).json("Post not found.")
        }
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
})
//get timeline posts
router.get("/timeline/all", async (req, res) => {
    try {
        const currentUser = await User.findById(req.body.userId)
        const userPosts = await Post.find({userId: currentUser.id})
        const friendPosts = await Promise.all(
            currentUser.followings.map(friendId => {
                return Post.find({userId: friendId})
            })
        )
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (error) {
        res.status(500).json(error)
    }
})


module.exports = router
const router = require("express").Router()
const bcrypt = require("bcrypt")
const User = require("../models/User")

//update user
router.put("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        if(req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch (error) {
                return res.status(500).json(error)
            }
        }

        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            })
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        return res.status(403).json("You can update only your account")
    }
})
//delete user
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        return res.status(403).json("You can delete only your account")
    }
})
//get a user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) return res.status(404).json("User not found.")
        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other)
    } catch (error) {
        res.status(500).json(error)
    }
})
//follow a user
router.put("/:id/follow", async (req, res) => {
    try {
        if(req.body.userId !== req.params.id) {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({$push: {followers: req.body.userId}})
                await currentUser.updateOne({$push: {followings: req.params.id}})
                res.status(200).json("User follow success.")
            } else {
                res.status(403).json("Already following the user.")
            }
        } else {
            res.status(403).json("Cannot follow yourself.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})
//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    try {
        if(req.body.userId !== req.params.id) {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({$pull: {followers: req.body.userId}})
                await currentUser.updateOne({$pull: {followings: req.params.id}})
                res.status(200).json("User unfollow success.")
            } else {
                res.status(403).json("Not following the user.")
            }
        } else {
            res.status(403).json("Cannot unfollow yourself.")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})


module.exports = router
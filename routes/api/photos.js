const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const fs = require('fs');
const upload = require('../../middleware/upload');

const User = require('../../models/User').user;
const Photo = require('../../models/Photo').photo;

// @route POST api/photos
// Upload your Photo
// @access private
router.post('/', [auth, upload.single("file")
    //check('birdName', 'birdname is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const photo = {
            userId: req.user.userId,
            image: req.file.filename,
            birdName: req.body.birdName,
            location: req.body.location,
            likes: []
        }

        const post = await Photo.create(photo);

        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

})

// @route api/photos
// Get all photos
// @public
router.get('/', async (req, res) => {

    try {
        let photos = [];
        if (req.query.birdName && req.query.location) {
            photos = await Photo.findAll({
                attributes: ['photoId', 'userId', 'image', 'birdName', 'location', 'likes'],
                where: {
                    birdName: req.query.birdName,
                    location: req.query.location
                }
            })
        }
        else if (req.query.birdName) {
            photos = await Photo.findAll({
                attributes: ['photoId', 'userId', 'image', 'birdName', 'location', 'likes'],
                where: {
                    birdName: req.query.birdName
                }
            })
        } else if (req.query.location) {
            photos = await Photo.findAll({
                attributes: ['photoId', 'userId', 'image', 'birdName', 'location', 'likes'],
                where: {
                    location: req.query.location
                }
            })
        } else {
            photos = await Photo.findAll({
                attributes: ['photoId', 'userId', 'image', 'birdName', 'location', 'likes']
            })
        }

        let newPhotos = await Promise.all(photos.map(async photo => {
            let user = await User.findAll({
                attributes: ['username'],
                where: {
                    userId: photo.userId
                }
            })

            return { ...photo.dataValues, user: user[0].username };
        }))

        res.json(newPhotos);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

})

// @route api/photos/:id
// Get photo by id
// @access public
router.get('/:id', async (req, res) => {
    try {
        const photo = await Photo.findAll({
            where: {
                photoId: req.params.id
            }
        })

        if (!photo.length) {
            return res.status(404).json({ msg: 'Photo not Found' });
        }
        console.log(photo);
        res.json(photo);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
})

// @route api/photos/edit/:id
// Edit Photo Info
// @access private
router.patch('/update/:id', [auth, [
    check('birdName', 'Birdname is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty()
]], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        
        if(req.user.userId !== req.body.userId) {
            return res.status(401).json({ msg: 'Unauthorized request'});
        }

        const updatedPhoto = await Photo.update(
            {birdName: req.body.birdName, location: req.body.location},
            { where: {photoId: req.params.id} }
        )
       
        res.json("Updated Successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

// @route api/photos/:id
// Delete Photo
// @access private
router.delete('/:id', auth,  async (req, res) => {
    try {
        const photo = await Photo.findAll({
            where: {
                photoId: req.params.id
            }
        })
       
        if(req.user.userId !== photo[0].dataValues.userId) {
            return res.status(401).json({ msg: 'Unauthorized request'});
        }

        await Photo.destroy(
            { where: {photoId: req.params.id} }
        )
       
        res.json(photo[0].dataValues);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})

// @route api/photos/like/:id
// Like a photo
// @access private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const photo = await Photo.findAll({
            where: {
                photoId: req.params.id
            }
        })
       
        // Check if photo has already been liked by user
        if(photo[0].dataValues.likes.includes(req.user.userId)) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        photo[0].dataValues.likes.unshift(req.user.userId);

        await Photo.update(
            { likes: photo[0].dataValues.likes },
            { where: { photoId: req.params.id } }
        )

        res.json(photo[0].dataValues.likes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;
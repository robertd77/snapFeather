const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User').user;

// @route GET api/auth
// Get user by token
// @access Private
router.get('/', auth, async (req,res) => {
    //console.log(req.user);
    try {
        const user = await User.findAll({
            attributes: { exclude: ['password'] },
            where: {
                userId: req.user.userId
            }
        })
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route POST api/auth
// Authenticate User, Get token
// @access public
router.post('/', [
    check('email', 'Please Include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body; 
    try {
        let user = await User.findAll({
            where: {
                email: email
            }
        })
        
        if(!user.length) {
            return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' } ] });
        }
        user = user[0].dataValues;
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ errors: [ { msg: 'Invalid Credentials' } ] });
        }

        const payload = {
            user: {
                userId: user.userId
            }
        }

        jwt.sign(payload, 
            config.get('jwtSecret'), 
            { expiresIn: 36000 },
            (error, token) => {
                if(error) {
                    throw error;
                }
                res.json({ token });
            })

       
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

module.exports = router;


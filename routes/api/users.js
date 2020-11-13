const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt =  require('bcryptjs');
const { check, validationResult } = require('express-validator');
const config = require('config');

const User = require('../../models/User').user;

// @route POST api/users
// Register User
// @access public
router.post('/', [
    check('email', 'Please Include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    check('username', 'Username is required').exists(),
], async (req,res) => {
    const errors = validationResult(req);
    //console.log(req.body);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password } = req.body; 
    try {
        let user = await User.findAll({
            where: {
                email: email
            }
        })

        if(user.length) {
            return res.status(400).json({ errors: [ { msg: 'User already taken' } ] });
        }
        
        user = { ...req.body };
   
        const salt =  await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const newUser = await User.create(user);

        const payload = {
            user: {
                userId: newUser.dataValues.userId
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
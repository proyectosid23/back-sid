const User = require('../models/User');
const crypto = require('crypto');
const bcryptjs = require('bcryptjs')
const accountVerificationEmail = require('./accountVerificationEmail');
const { userSignedUpResponse, userNotFoundResponse, invalidCredentialsResponse, userSignedOutResponse } = require('../config/responses');
const jwt = require('jsonwebtoken')


const controller = {

    register: async (req, res, next) => {
        let { email, password, name, lastName, codReferido } = req.body;
        let role = 'user';
        let verified = false
        let logged = false
        let code = crypto.randomBytes(10).toString('hex');
        let codReferir = crypto.randomBytes(5).toString('hex');
        let saldoActual = 0;
        let planes = [];
        let beforePassword = password;
        password = bcryptjs.hashSync(password, 10);

        try {

            const userCode = await User.findOne({ codReferir: codReferir })

            if (userCode) {
                codReferir = crypto.randomBytes(5).toString('hex');
            }

            await User.create({ role, email, password, name, lastName, codReferido, codReferir, code, verified, logged, saldoActual, planes })
            const refUser = await User.findOne({codReferir: codReferido})
            refUser.referidos.push(code)
            refUser.save()
            await accountVerificationEmail(email, code, beforePassword)
            return userSignedUpResponse(req, res)
        } catch (error) {
            next(error)
        }
    },
            
    verify: async (req, res, next) => {
        const { code } = req.params;

        try {
            let user = await User.findOneAndUpdate({ code: code }, { verified: true }, { new: true })
            if (user) {
                return res.redirect('https://www.google.com')
            }
            return userNotFoundResponse(req, res)

        } catch (error) {
            next(error)
        }
    },

    login: async (req, res, next) => {
        let { password } = req.body;
        let { user } = req;
        try {
            const verifyPassword = bcryptjs.compareSync(password, user.password)
            if (verifyPassword) {
                const userDb = await User.findOneAndUpdate({ _id: user.id }, { logged: true }, { new: true })
                let token = jwt.sign(
                    {
                        id: userDb._id,
                        role: userDb.role,
                        email: userDb.email,
                        name: userDb.name,
                        logged: userDb.logged,
                    },
                    process.env.KEY_JWT,
                    { expiresIn: 60 * 60 * 24 }
                )

                return res.status(200).json({
                    response: { user, token },
                    success: true,
                    message: `Hello ${userDb.name}, welcome!`
                })
            }
            return invalidCredentialsResponse(req, res)
        } catch (error) {
            next(error)
        }
    },

    loginWithToken: async (req, res, next) => {

        let { user } = req;
        try {
            return res.json({
                response: { user },
                success: true,
                message: `Welcome ${user.name}`
            })

        } catch (error) {
            next(error)
        }
    },

    logout: async (req, res, next) => {
        const { id } = req.user;

        try {
            let user = await User.findOneAndUpdate(
                { _id: id },
                { logged: false },
                { new: true }
            );

            return userSignedOutResponse(req, res);
        } catch (error) {
            next(error);
        }
    },

    readOne: async (req, res, next) => {
        let id = req.params.id;
        try {
            let user = await User.findById({ _id: id })
            if (user) {
                res.status(200).json({
                    success: true,
                    message: 'the user was found successfully!.',
                    data: user,
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: 'the user was not found.',
                })
            }
        } catch (error) {
            next(error)
        }
    },

    read: async (req, res) => {
        let query = {};
        let order = {};

        if (req.query.userId) {
            query = { userId: req.query.userId };
        }
        if (req.query.code) {
            query = { code: req.query.code };
        }
        if (req.query.name) {
            query = {
                ...query,
                name: { $regex: req.query.name, $options: "i" },
            };
        }
        if (req.query.order) {
            order = {
                name: req.query.order,
            };
        }

        try {
            let all_users = await User.find(query).sort(order);
            if (all_users) {
                res.status(200).json({
                    success: true,
                    message: "the users were successfully found",
                    response: all_users,
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "there are no users",
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
    },
    
    update: async (req, res, next) => {
        let id = req.params.id;
        if (req.body.password) {
            let { password } = req.body;
            password = bcryptjs.hashSync(password, 10);
            req.body.password = password;
        }

        try {
            let user = await User.findOneAndUpdate({ _id: id }, req.body, { new: true });

            if (user) {
                res.status(200).json({
                    success: true,
                    message: "The user was successfully modified!",
                    data: user,
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: "The user was not found",
                });
            }
        } catch (error) {
            next(error)
        }
    },

}

module.exports = controller;
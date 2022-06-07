const express = require('express');
const methodOverride = require('method-override');
const sessions = require('express-session');
const flash = require('connect-flash');
const config = require('../apps/config')
const passport = require('passport')
let RedisStore = require("connect-redis")(sessions)
// redis@v4
const { createClient } = require("redis")
let redisClient = createClient({
    url: "redis://:p00f050a78710f2cd2f889f4b7e6d6d2b8c182bab3553a98b6939a45f7e9d85f1@ec2-3-226-70-204.compute-1.amazonaws.com:29720",
    socket: {
        tls: true,
        rejectUnauthorized: false
    }
})
redisClient.connect().catch(console.error)

module.exports = function (app) {
    //redisClient.on('connect', () => console.log('Redis Client Connected'));
    //redisClient.on('error', (err) => console.log('Redis Client Connection Error', err));
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method
            delete req.body._method
            return method
        }
    }))
    app.use(sessions({
        secret: 'pr0de$$0',
        resave: true,
        //store: new RedisStore({ client: redisClient }),
        saveUninitialized: false,
        cookie: { _expires: 18000 }, // time im ms
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash())
}

const express = require('express')
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {secret} = require('./config')
const cookieParser = require('cookie-parser')
const Schema = mongoose.Schema;

const articleScheme = new Schema({
    title: String,
    description: String,
    date: String,
    likes: Number,
    dislikes: Number,
    views: Number,
    file: String,
    author: String,
    commentsCount: String
}, {versionKey: false})

const userSchema = new Schema({
    email: {type: String, unique: true, required: true},
    pass: {type: String, unique: true, required: true},
    role: [{type: String}]
}, {versionKey: false})

const articles = mongoose.model("Article", articleScheme)
const users = mongoose.model("User", userSchema)


const path = require('path')
const app = express()
const {v4} = require('uuid')

//let ARTICLES = []

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'images')))
app.use(express.static(path.resolve(__dirname, 'client')))

app.use(express.json())
app.use(cookieParser())

const generateAccessToken = (id, name) => {
    const payload = {
        id,
        name
    }
    return jwt.sign(payload, secret, {expiresIn: "24h"})
}

app.get('/api/articles', (req, res) => {
    try {
        articles.find({}, function (err, articles) {
            res.status(200).json(articles)
        });
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error retrieving data from the database'})
    }
})
app.get(`/api/articles/:id`, (req, res) => {
    try {
        articles.find({_id: req.params.id}, function (err, article) {
            res.status(200).json(article)
        });
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Error retrieving data from the database'})
    }
})
app.get('/api/checkAccess', (req, res) => {
    try {
        let cookie = req.cookies['tokenValue']
        let checkingTokenResult = jwt.verify(cookie, secret)
        res.json({message: checkingTokenResult})
    } catch (e) {
        console.log(e)

        return res.status(403).json({message: "you are not authorized"})
    }
})
app.post('/api/articles', (req, res) => {
    try {
        let article = {...req.body}
        addArticleToBD(article)
        res.status(201).json(article)
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'error of adding article to database'})
    }
    /* req.files.photo.mv('uploads/'+ req.files.photo.name)
     console.log(article)*/
})
app.post('/api/articlesImage', (req, res) => {

    let article = {...req.body}
    req.files.photo.mv('uploads/' + req.files.photo.name)
    console.log(article)
    // addArticleToBD(article)
    // ARTICLES.push(article)
    res.status(201).json(article)
})
app.post('/api/userSignIn', (req, res) => {
    let user = {...req.body}
    Authorization(user, req, res)
})
app.post('/api/userSignUp', (req, res) => {
    let user = {...req.body}
    Registration(user, req, res)
})

app.delete('/api/articles/:id', (req, res) => {
    ARTICLES = ARTICLES.filter(c => c.id !== req.params.id)
    res.status(200).json({message: "Article has been deleted"})
})

app.put('/api/articles/:id', (req, res) => {
    const idx = ARTICLES.findIndex(c => c.id === req.params.id)
    ARTICLES[idx] = req.body
    res.json(ARTICLES[idx])
})

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'index.html'))
})

async function addArticleToBD(article) {
    await articles.create({
            id: article.id,
            title: article.title,
            description: article.description,
            date: article.date,
            likes: article.likes,
            dislikes: article.dislikes,
            views: article.views,
            commentsCount: article.commentsCount,
            file: article.file,
            author: article.author
        },
        function (err, doc) {
            if (err) return console.log(err);
            console.log("Сохранен объект user", doc);
        })
}

async function Authorization(user, req, res) {
    try {
        const existUser = await users.findOne({
            email: user.email
        });
        if (existUser !== null) {
            const validPassword = await bcrypt.compareSync(user.pass, existUser.pass)
            if (!validPassword) {
                res.status(400).json({message: `passwords mismatch `})
            } else {
                let token = await generateAccessToken(user._id, user.email);
                res.cookie(`token= ${token}; Secure; HttpOnly`)
                console.log(token)
                res.json({token: token})
            }
        } else {
            console.log("нет такого пользователя")
            res.status(400).json({message: `User ,${user.email}, doesnt exist`})
        }
    } catch (e) {
        res.status(400).json({message: `Error authorization`})
    }
}

async function Registration(user, req, res) {
    try {
        const candidate = await users.findOne({
            email: user.email
        });
        if (candidate == null) {
            const hashPassword = bcrypt.hashSync(user.pass, 4)
            await users.create({
                    email: user.email,
                    pass: hashPassword
                },
                async function (err, doc) {
                    if (err) return console.log(err);
                    console.log(doc);
                });
        } else {

        }
    } catch (e) {

    }
}

async function start() {
    try {
        await mongoose.connect("mongodb+srv://dima:1088834@cluster0.uwrbc.mongodb.net/dbtest", {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        app.listen(3000, () => {
            console.log('Server has been started successfully....')
        })
    } catch (e) {
        console.log(e)
    }
}

start()
const mysql = require('mysql');
const express = require('express');
var bodyParser = require('body-parser');
const path = require('path');
const router = express.Router();
const jwt = require('jsonwebtoken');
const app = express();
const port = 3001;
const dotenv = require("dotenv").config();
const { parsed } = dotenv;
const bcrypt = require("bcrypt");

// router.use()
// app.use(bodyParser.json);
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({extended: false}));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var mysqlConnection = mysql.createConnection({
    host: parsed.MYSQL_HOST,
    user: parsed.MYSQL_USER,
    password: parsed.MYSQL_ROOT_PASSWORD,
    database: parsed.MYSQL_DATABASE,
});

mysqlConnection.connect((err) => {
    if (!err)
        console.log('DB connection success !');
    else {
        console.log('DB connection failed.');
        console.log(err);
    }
});

//REGISTER REQUEST
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/views/register/register.html')
});
app.post('/registerpost', (req, res) => {
    const dotenv = require('dotenv');
    dotenv.config();
    process.env.SECRET;

    const user_table = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        firstname: req.body.firstname,
    };
    let sql = "INSERT INTO user SET ?";
    mysqlConnection.query("SELECT * FROM user WHERE email = ?", user_table.email, (err, rows) => {
        if (err)
            throw err;
        if (rows.length > 0) {
            res.send("Account already exists");
        } else {
            bcrypt.genSalt(10, (err, str) => {
                bcrypt.hash(user_table.password, str, (err, hash) => {
                    if (err)
                        throw err;
                    mysqlConnection.query(sql, user_table, (err, rows) => {
                        if (err)
                            throw err;
                        res.render('register/register_submit.html', {token:token})
                    });
                });
            });
        }
    });
    const token = generateAccessToken({ username: user_table.email });
    function generateAccessToken(username) {
        return jwt.sign(username, process.env.SECRET, { expiresIn: '1800s' });
    }

});

//LOGIN REQUEST
app.get("/login", (req, res) => {
    res.sendFile(__dirname + '/views/login/login.html')
});
app.post("/loginpost", (req, res) => {
    const dotenv = require('dotenv');
    dotenv.config();
    process.env.SECRET;
    let email = req.body.email;
    let password = req.body.password;

    if (email && password) {
        mysqlConnection.query('SELECT * FROM user WHERE email = ?',
        [email], function(error, results, fields) {
            if (error)
                throw error;
            if (results.length > 0) {
                // bcrypt.compare(password, results[0].password)
            } else {
                res.sendFile(__dirname + '/views/login/login_incorrect.html')
            }
            res.sendFile(__dirname + '/views/login/login_succes.html')
        });
        const token = generateAccessToken({ username: email});
        function generateAccessToken(username) {
            return jwt.sign(username, process.env.SECRET, { expiresIn: '1800s' });
        }
    } else {
        res.sendFile(__dirname + '/views/login/login_void.html')
    }
});

//=====================USER REQUEST=====================

app.get('/user', (req, res) => {
    let sql = "SELECT * FROM user";

    mysqlConnection.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send(rows);
    });
});

app.get('/users/:id', (req, res) => {
    //gerer l'email
    var id = req.params.id;

    mysqlConnection.query('SELECT * FROM user WHERE id = ?',
    [id], (err, rows, fields) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.render('user/display_user.html',
        {id:id, email:rows[0].email, password:rows[0].password, name:rows[0].name, firstname:rows[0].firstname, created_at:rows[0].created_at})
    });
});

app.put('/users/:id', (req, res) => {
    var id = req.params.id;
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let firstname = req.body.firstname;

    mysqlConnection.query(`UPDATE user SET email = ?, password = ?, name = ?,
    firstname = ? WHERE id = ${req.params.id}`,
    [email, password, name, firstname], (err, rows, fields) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send(rows);
    });
});

app.delete('/users/:id', (req, res) => {
    var id = req.params.id;

    mysqlConnection.query('DELETE FROM user WHERE id = ' + id,
    function(err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send("Successfully deleted record number : id = " + id);
    });
});

app.get('/users/todos', (req, res) => {
    let sql = "SELECT * FROM todo";

    mysqlConnection.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send(rows);
    });
});

//=====================+TODO=====================

app.get('/todos', (req, res) => {
    res.sendFile(__dirname + '/views/todos/create_todo.html')
});

app.post('/todospost', (req, res) => {
    let sql = "SELECT * FROM todo"

    mysqlConnection.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.sendFile(__dirname + '/views/todos/created_todo.html')
    });
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    let sql = "SELECT * FROM todo WHERE id = ?"

    mysqlConnection.query(sql, [id], (err, rows) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send(rows);
    });
});

app.post('/todos', (req, res) => {
    const todo_table = {
        title: req.body.title,
        description: req.body.description,
        due_time: req.body.due_time,
        user_id: req.body.user_id
    };
    let sql = "INSERT INTO todo SET ?";

    mysqlConnection.query(sql, todo_table, (err, rows) => {
        if (err)
            throw err;
        res.send(todo_table);
    });
});

app.put('/todos/:id', (req, res) => {
    var id = req.params.id;
    let title = req.body.title;
    let description = req.body.description;
    let due_time = req.body.due_time;
    let user_id = req.body.user_id;

    mysqlConnection.query(`UPDATE todo SET title = ?, description = ?,
    due_time = ?, user_id = ? WHERE id = ${req.params.id}`,
    [title, description, due_time, user_id], (err, rows) => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;

    mysqlConnection.query('DELETE FROM todo WHERE id = ' + id,
    function(err, result) {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send("Successfully deleted record number : id = " + id);
    });
});

app.listen(port, (req, res) => {
    console.log(`Express server is running at port ${port}`)
});

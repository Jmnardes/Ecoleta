const express = require('express')
const server = express()

// pegar o db
const db = require('./database/db.js')

// configurar pasta public
server.use(express.static('public'))

// habilita o uso do req.body
server.use(express.urlencoded({ extended: true }))

// utilizando template engine
const nunjucks = require('nunjucks')
nunjucks.configure('src/views', {
    express: server,
    noCache: true
})


// configurar caminhos da app, pag inicial
// req: requisição , res: resposta
server.get('/', (req, res) => {
    return res.render('index.html')
})

server.get('/create-point', (req, res) => {

    // req.query = são os query strings da nossa url
    // req.query

    return res.render('create-point.html')
})

server.post('/create-point', (req, res) => {

    // req.body = é o corpo da aplicação
    // req.body
    // inserir dados no bd
    const query = `
        INSERT INTO places (
            name,
            image,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `
    const values = [
        req.body.name,
        req.body.image,
        req.body.address,
        req.body.addres2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if(err) {
            console.log(err)
            return res.send("Erro no cadastro!")
        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render('create-point.html', { saved: true })
    }

    db.run(query, values, afterInsertData)
})


server.get('/search', (req, res) => {

    const search = req.query.search

    if(search == '') {
        // pesquisa vazia
        return res.render('search-results.html', { total: 0 })
    }

    // pegar os dados do db
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if(err) {
            return console.log(err)
        }

        const total = rows.length
        
        // mostrar a pagina html com os dados do db
        return res.render('search-results.html', { places: rows, total: total })
    })
})


// ligar o servidor
server.listen(3000)
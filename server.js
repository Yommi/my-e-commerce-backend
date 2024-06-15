const dotenv = require('dotenv')

dotenv.config({ path: './config.env' })
console.log(`NODE ENVIRONMENT: ${process.env.NODE_ENV}`)

const app = require('./app')

const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`App running on port ${port}...`)
})


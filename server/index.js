
const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Requests from front end
  app.get('/ocr', (req, res) => {
    const fileName = 'assets/advertisement.jpg';
    client.textDetection(fileName)
      .then(results => {
        const detections = results[0].textAnnotations;
        console.log('Text:');
        detections.forEach(text => console.log(text));
        res.send('request succeeded');
      })
      .catch(err => {
        console.log('ERROR:', err);
      })
  })

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()

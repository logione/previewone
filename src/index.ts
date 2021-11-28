import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'

import { ImageMagickClient } from './imagemagick-client'

const app = express()
const imageMagickClient = new ImageMagickClient()

app.use(bodyParser.json())
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.path}:${req.body.fileName}`)
    next()
})

app.get('/', (_req: Request, res: Response) => {
    res.send('OK')
})

app.post('/convert', async (req: Request, res: Response) => {
    const { downloadUrl, uploadUrl, fileName } = req.body
    if (!downloadUrl || !uploadUrl || !fileName) {
        return res.sendStatus(400)
    }
    try {
        await imageMagickClient.convert(downloadUrl, uploadUrl, fileName)
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

app.post('/resize', async (req: Request, res: Response) => {
    const { downloadUrl, uploadUrl, fileName } = req.body
    if (!downloadUrl || !uploadUrl || !fileName) {
        return res.sendStatus(400)
    }
    try {
        await imageMagickClient.resize(downloadUrl, uploadUrl, fileName)
        res.sendStatus(204)
    } catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

app.listen(8081, () => {
   console.log('Listen to 8081')
})
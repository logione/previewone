import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'

import { ImageMagickClient } from './imagemagick-client'
import { QueryBody } from './query-body'

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
    const parsed = QueryBody.safeParse(req.body)
    if (parsed.success === false) {
        console.warn(parsed.error)
        return res.sendStatus(400)
    }
    const { downloadUrl, uploadUrl, fileName } = parsed.data
    try {
        await imageMagickClient.convert(downloadUrl, uploadUrl, fileName)
        return res.sendStatus(204)
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
})

app.post('/resize', async (req: Request, res: Response) => {
    const parsed = QueryBody.safeParse(req.body)
    if (parsed.success === false) {
        console.warn(parsed.error)
        return res.sendStatus(400)
    }
    const { downloadUrl, uploadUrl, fileName } = parsed.data
    try {
        await imageMagickClient.resize(downloadUrl, uploadUrl, fileName)
        return res.sendStatus(204)
    } catch (err) {
        console.error(err)
        return res.sendStatus(500)
    }
})

app.listen(8081, () => {
   console.log('Listen to 8081')
})
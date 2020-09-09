import { spawn } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import got from 'got'
import { pipeline, PassThrough } from 'stream'

const pipelineAsync = promisify(pipeline)
const unlink = promisify(fs.unlink)

export class ImageMagickClient {
    async convert(downloadUrl: string, uploadUrl: string, fileName: string) {
        const output = `${fileName}.png`
        try {
            await this.download(downloadUrl, fileName)
            await this.run('-density', '200', `${fileName}[0]`, '-flatten', '-quality', '80', output)
            await this.upload(uploadUrl, output)
        } finally {
            await this.tryUnlink(fileName)
            await this.tryUnlink(output)
        }
    }

    async resize(downloadUrl: string, uploadUrl: string, fileName: string) {
        try {
            await this.download(downloadUrl, fileName)
            await this.run(fileName, '-resize', '1000000@', '-quality', '80', fileName)
            await this.upload(uploadUrl, fileName)
        } finally {
            await this.tryUnlink(fileName)
        }
    }

    private async tryUnlink(fileName: string) {
        try {
            await unlink(fileName)
        } catch(err) {
        }
    }

    private async download(url: string, fileName: string) {
        await pipelineAsync(
            got.stream(url),
            fs.createWriteStream(fileName)
        )
    }

    private async upload(url: string, fileName: string) {
        await pipelineAsync(
            fs.createReadStream(fileName),
            got.stream.post(url),
            new PassThrough()
        )    
    }

    private async run(...args: string[]) {
        return await new Promise((resolve, reject) => {
            const ls = spawn('convert', args)
    
            ls.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`)
            })
        
            ls.on('close', (code) => {
                if (code) {
                    reject(code)
                } else {
                    resolve()
                }
            })
        })
    }
}

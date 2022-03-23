import { spawn } from 'child_process'
import { createWriteStream, createReadStream } from 'fs'
import { stat, unlink } from 'fs/promises'
import got from 'got'
import { PassThrough } from 'stream'
import { pipeline } from 'stream/promises'

export class ImageMagickClient {
    async convert(downloadUrl: string, uploadUrl: string, fileName: string): Promise<void> {
        const png = `${fileName}.png`
        const jpg = `${fileName}.jpg`
        try {
            await this.download(downloadUrl, fileName)
            await Promise.all([
                this.run('-density', '200', `${fileName}[0]`, '-resize', '1029', '-flatten', '-quality', '80', png),
                this.run('-density', '200', `${fileName}[0]`, '-resize', '1029', '-flatten', '-quality', '80', jpg),
            ])
            const [ pngStat, jpgStat ] = await Promise.all([
                stat(png),
                stat(jpg)
            ])
            if (pngStat.size < jpgStat.size) {
                await this.upload(uploadUrl, png)
            } else {
                await this.upload(uploadUrl, jpg)
            }
        } finally {
            await Promise.all([
                this.tryUnlink(fileName),
                this.tryUnlink(png),
                this.tryUnlink(jpg)
            ])
        }
    }

    async resize(downloadUrl: string, uploadUrl: string, fileName: string): Promise<void> {
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
        await pipeline(
            got.stream(url),
            createWriteStream(fileName)
        )
    }

    private async upload(url: string, fileName: string) {
        await pipeline(
            createReadStream(fileName),
            got.stream.put(url, { headers: { 'Content-Type': 'application/octet-stream', 'ngsw-bypass': '' } }),
            new PassThrough()
        )
    }

    private async run(...args: string[]) {
        return await new Promise<void>((resolve, reject) => {
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

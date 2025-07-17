import { getStream, putStream } from '@logi.one/rest-client'

import { spawn } from 'child_process'
import { createWriteStream, createReadStream } from 'fs'
import { unlink, stat } from 'fs/promises'
import { pipeline } from 'stream/promises'

export class ImageMagickClient {
    async convert(downloadUrl: string, uploadUrl: string, fileName: string): Promise<void> {
        const png = `${fileName}.png`
        try {
            await this.download(downloadUrl, fileName)
            await this.run('-density', '200', `${fileName}[0]`, '-resize', '1029', '-flatten', '-quality', '80', png)
            await this.upload(uploadUrl, png)
        } finally {
            await Promise.all([
                this.tryUnlink(fileName),
                this.tryUnlink(png)
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
            await getStream(url),
            createWriteStream(fileName)
        )
    }

    private async upload(url: string, fileName: string) {
        const { size } = await stat(fileName)
        await putStream(
            url,
            createReadStream(fileName),
            { headers: { 'Content-Type': 'application/octet-stream', 'ngsw-bypass': '', 'Content-Length': `${size}` } }
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

import { Readable } from 'stream'
import cloudinary from '../lib/cloudinary.js'

export async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' })
  }

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (err, result) => (err ? reject(err) : resolve(result))
      )
      Readable.from(req.file.buffer).pipe(stream)
    })

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    return res.status(500).json({ error: 'Cloudinary upload failed' })
  }
}

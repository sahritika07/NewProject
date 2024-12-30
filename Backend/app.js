import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import connectDB from './config/connectdb.js'
import userRoutes from './routes/userRoutes.js'
// import { uploadOnCloudinary } from './utils/cloudinary.js'; 
// const multer = require('multer');
// const cloudinary = require('cloudinary').v2;
// const streamifier = require('streamifier');


const app = express()
const port = process.env.PORT // accessing the port
const DATABASE_URL = process.env.DATABASE_URL

app.use(cors())
connectDB(DATABASE_URL)
app.use(express.json())



// Load Routes

app.use("/api/user", userRoutes)

// app.post('/upload', async (req, res) => {
//     try {
//         const filePath = req.file.path; // Assuming you're using middleware like multer
//         const result = await uploadOnCloudinary(filePath);
//         if (!result) {
//             return res.status(500).json({ message: 'Upload failed' });
//         }
//         res.status(200).json({ message: 'Upload successful', data: result });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'An error occurred' });
//     }
// });

// app.post('/upload', upload.single('file'), async (req, res) => {
//     try {
//         const fileBuffer = req.file.buffer; // Get file buffer from multer
//         const result = await cloudinary.uploader.upload_stream(
//             { resource_type: 'auto' },
//             (error, response) => {
//                 if (error) {
//                     console.error('Cloudinary upload failed:', error);
//                     return res.status(500).json({ message: 'Upload failed' });
//                 }
//                 res.status(200).json({ message: 'Upload successful', data: response });
//             }
//         );
//         streamifier.createReadStream(fileBuffer).pipe(result);
//     } catch (error) {
//         console.error('An error occurred:', error);
//         res.status(500).json({ message: 'An error occurred' });
//     }
// });


app.listen(port, ()=>{
    console.log(`Server listening at http://localhost:${port}`)
})

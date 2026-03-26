import { Controller, Post, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Define the API URL based on environment or set a default. A complete app might grab this from ConfigService.
const BASE_URL = process.env.PUBLIC_URL || 'http://localhost:3001';

@Controller('upload')
export class UploadsController {
  
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './public/uploads',
      filename: (req, file, cb) => {
        // Generate a random numeric string
        const randomName = Array(16).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|pdf)$/i)) {
        return cb(new HttpException('Solo imágenes y PDFs son permitidos', HttpStatus.BAD_REQUEST), false);
      }
      cb(null, true);
    }
  }))
  uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    // Retorna las URLs públicas de las imágenes subidas
    const urls = files.map(file => `${BASE_URL}/uploads/${file.filename}`);
    return { urls };
  }
}

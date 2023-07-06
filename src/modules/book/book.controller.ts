import * as fs from 'fs';
import * as path from 'path';
import {
  Controller,
  Get,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BookService } from './book.service';
import { wrapperCountResponse, wrapperResponse } from '../../utils';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  getBookList(@Query() params) {
    return wrapperCountResponse(
      this.bookService.getBookList(params),
      this.bookService.countBookList(params),
      '获取图书列表成功',
    );
  }

  @Get(':id')
  getBook(@Param('id', ParseIntPipe) id) {
    return 'get book:' + id;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadBook(@UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /epub/,
        })
        .build(),
    ) file: Express.Multer.File) {
    console.log(file);
    const destDir = '/opt/homebrew/var/www/upload';
    const destPath = path.resolve(destDir, file.originalname);
    fs.writeFileSync(destPath, file.buffer);
    return wrapperResponse(
      Promise.resolve().then(() => ({
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: destPath,
        dir: destDir,
      })),
      '上传文件成功',
    );
  }
}

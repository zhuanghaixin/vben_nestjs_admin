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
    return wrapperResponse(
      this.bookService.uploadBook(file),
      '上传文件成功',
    );
  }
}

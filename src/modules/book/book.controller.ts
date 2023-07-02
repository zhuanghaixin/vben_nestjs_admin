import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { wrapperResponse } from '../../utils';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  getBookList(@Query() params) {
    return wrapperResponse(
      this.bookService.getBookList(params),
      '获取图书列表成功',
    );
  }

  @Get(':id')
  getBook(@Param('id', ParseIntPipe) id) {
    return 'get book:' + id;
  }
}

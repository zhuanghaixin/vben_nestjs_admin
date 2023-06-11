import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { MenuService } from './menu.service';
import { wrapperResponse } from '../../utils';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get(':id')
  getMenu(@Param('id', ParseIntPipe) id: number) {
    // return this.userService.findOne(id);
  }

  @Get()
  getAllMenu() {
    return wrapperResponse(
      this.menuService.findAll(),
      '获取菜单成功',
    );
  }

  @Post()
  create(@Body() body) {
    // return this.userService.create(body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // return this.userService.remove(id);
  }
}

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { RoleService } from './role.service';
import { wrapperResponse } from '../../utils';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get(':id')
  getRole(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Get()
  getAllRole(@Query() query) {
    return wrapperResponse(
      this.roleService.findAll(query),
      '获取角色列表成功',
    );
  }

  @Put()
  update(@Body() body) {
    return wrapperResponse(
      this.roleService.update(body),
      '编辑角色成功',
    );
  }

  @Post()
  create(@Body() body) {
    return wrapperResponse(
      this.roleService.create(body),
      '新增角色成功',
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.remove(id);
  }
}

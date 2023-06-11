import { Injectable } from '@nestjs/common';
import { MENU_LIST } from './menu.data';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './user.entity';

@Injectable()
export class MenuService {
  constructor(
    // @InjectRepository(User)
    // private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return new Promise((resolve) => {
      resolve(MENU_LIST);
    });
  }
}

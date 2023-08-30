import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { DeleteResult } from 'typeorm/query-builder/result/DeleteResult';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  findOne(id: number): Promise<Role> {
    return this.roleRepository.findOneBy({ id });
  }

  findAll(query: any): Promise<Role[]> {
    const sql = `SELECT id, name, remark FROM role`;
    return this.roleRepository.query(sql);
  }

  create(params) {
    const role = new Role();
    role.name = params.name;
    role.remark = params.remark;
    console.log(role);
    return this.roleRepository.save(role);
  }

  update(params) {
    const { name, remark } = params;
    const setSql = [];
    if (remark) {
      setSql.push(`remark="${remark}"`);
    }
    const updateSql = `UPDATE role SET ${setSql.join(',')} WHERE name="${name}"`;
    return this.roleRepository.query(updateSql);
  }

  remove(id: number): Promise<DeleteResult> {
    return this.roleRepository.delete(id);
  }

  findByUsername(username: string) {
    // return this.roleRepository.findOneBy();
  }
}

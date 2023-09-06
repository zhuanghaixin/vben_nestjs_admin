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
    const { name, remark, id } = params;
    const setSql = [];
    if (name || remark) {
      name && setSql.push(`name="${name}"`);
      remark && setSql.push(`remark="${remark}"`);
      const updateSql = `UPDATE role SET ${setSql.join(',')} WHERE id="${id}"`;
      return this.roleRepository.query(updateSql);
    } else {
      return Promise.resolve({});
    }
  }

  remove(id: number): Promise<DeleteResult> {
    return this.roleRepository.delete(id);
  }

  findByUsername(username: string) {
    // return this.roleRepository.findOneBy();
  }

  async createRoleMenu(params) {
    const { roleId, menuId } = params;
    const insertSql = `INSERT INTO role_menu(
        roleId,
        menuId
      ) VALUES(
        '${roleId}',
        '${menuId}'
      )`;
    // 建立 roleId 和 menuId 的绑定关系
    const ret = await this.roleRepository.query(insertSql);
    // 查询 menu 信息
    const menuList = await this.roleRepository.query(`
      SELECT * FROM menu WHERE id='${menuId}'
    `);
    const roleList = await this.roleRepository.query(`
      SELECT * FROM role WHERE id='${roleId}'
    `);
    const [menu] = menuList || [];
    const [role] = roleList || [];
    if (menu && role) {
      let { meta } = menu;
      meta = JSON.parse(meta) || {};
      let flag = true;
      if (meta.roles && meta.roles.length > 0) {
        if (!meta.roles.includes(role.name)) {
          const roles = JSON.parse(meta.roles);
          roles.push(role.name);
          meta.roles = JSON.stringify(roles);
          flag = false;
        }
      } else {
        meta.roles = JSON.stringify([role.name]);
      }
      if (flag) {
        meta.roles = meta.roles.replaceAll('"', '\\"');
        meta = JSON.stringify(meta);
        // 保存新的meta信息
        await this.roleRepository.query(`
        UPDATE menu SET meta='${meta}' WHERE id='${menuId}'
      `);
      }
    }
    return ret;
  }

  removeRoleMenu(roleId) {
    if (roleId) {
      const sql = `DELETE FROM role_menu WHERE roleId='${roleId}'`;
      return this.roleRepository.query(sql);
    } else {
      return Promise.resolve({});
    }
  }

  getRoleMenu(roleId) {
    const sql = `SELECT roleId, menuId FROM role_menu WHERE roleId=${roleId}`;
    return this.roleRepository.query(sql);
  }
}

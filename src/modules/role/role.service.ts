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

  getAuthList(query) {
    const { key } = query;
    let where = '1=1';
    if (key) {
      where += ` AND \`key\` LIKE "%${key}%"`;
    }
    const sql = `SELECT * FROM auth WHERE ${where}`;
    return this.roleRepository.query(sql);
  }

  createAuth(params) {
    const { key = '', name = '', remark = '' } = params;
    const insertSql = `INSERT INTO auth(
        \`key\`,
        name,
        remark
      ) VALUES(
        '${key}',
        '${name}',
        '${remark}'
      )`;
    return this.roleRepository.query(insertSql);
  }

  updateAuth(params) {
    const { name, remark, id } = params;
    const setSql = [];
    if (name || remark) {
      name && setSql.push(`name="${name}"`);
      remark && setSql.push(`remark="${remark}"`);
      const updateSql = `UPDATE auth SET ${setSql.join(',')} WHERE id="${id}"`;
      return this.roleRepository.query(updateSql);
    } else {
      return Promise.resolve({});
    }
  }

  async createRoleAuth(params) {
    const { roleId, authId } = params;
    const insertSql = `INSERT INTO role_auth(
        roleId,
        authId
      ) VALUES(
        '${roleId}',
        '${authId}'
      )`;
    // 建立 roleId 和 authId 的绑定关系
    return await this.roleRepository.query(insertSql);
  }

  removeRoleAuth(body) {
    if (body.roleId) {
      const sql = `DELETE FROM role_auth WHERE roleId='${body.roleId}'`;
      return this.roleRepository.query(sql);
    } else if (body.authId) {
      const sql = `DELETE FROM role_auth WHERE authId='${body.authId}'`;
      return this.roleRepository.query(sql);
    } else {
      return Promise.resolve({});
    }
  }

  getRoleAuth(roleId) {
    const sql = `SELECT roleId, authId FROM role_auth WHERE roleId=${roleId}`;
    return this.roleRepository.query(sql);
  }

  /**
   * 根据角色名称获取对应的权限信息
   * @param roleName 角色名称数组的字符串形式
   * @returns 返回角色对应的权限信息列表
   */
  async getRoleAuthByRoleName(roleName) {
    console.log('roleName=============================', roleName);
    // 检查roleName是否为字符串，如果是则使用split转换为数组
    if (typeof roleName === 'string') {
      // 假设roleName是以逗号分隔的字符串，使用split方法转换为数组
      roleName = roleName.split(',');
    }
    console.log('roleNameA=============================', roleName);
    // 为每个角色名称添加单引号，以便在SQL查询中使用
    roleName = roleName.map((role) => `'${role}'`);
    console.log('roleNameB=============================', roleName);
    
    // 构建查询角色信息的SQL条件
    const where = `WHERE 1=1 AND name IN (${roleName.join(',')})`;
    // 构建完整的SQL查询语句，获取指定角色名称的角色ID和名称
    const sql = `SELECT id, name FROM role ${where}`;
    // 执行查询，获取角色列表
    const roleList = await this.roleRepository.query(sql);
    console.log('roleList=============================', roleList);
    // 从角色列表中提取所有角色ID
    const roleIds = roleList.map((role) => role.id);
    
    // 构建查询角色权限关系的SQL条件
    const authWhere = `WHERE 1=1 AND roleId IN (${roleIds.join(',')})`;
    // 构建完整的SQL查询语句，获取角色与权限的绑定关系
    const authSql = `SELECT roleId, authId FROM role_auth ${authWhere}`;
    // 执行查询，获取权限绑定列表
    const authList = await this.roleRepository.query(authSql);
    
    // 从权限绑定列表中提取所有权限ID
    let authIds = authList.map((auth) => auth.authId);
    
    // 使用Set去重，避免重复的权限ID
    const authSet = new Set();
    authIds.forEach((id) => authSet.add(id));
    // 将Set转换回数组
    authIds = Array.from(authSet);
    console.log('authIds', authIds);
    // 如果没有找到任何权限ID，则直接返回空数组
    if (authIds.length === 0) {
      return authIds;
    } else {
      // 否则，查询这些权限ID对应的完整权限信息
      const authInfo = await this.roleRepository.query(`
      SELECT * FROM auth WHERE id IN (${authIds.join(',')})
    `);
      // 返回权限信息列表
      return authInfo;
    }
  }

  removeAuth(authId) {
    if (authId) {
      const sql = `DELETE FROM auth WHERE id='${authId}'`;
      return this.roleRepository.query(sql);
    } else {
      return Promise.resolve({});
    }
  }
}

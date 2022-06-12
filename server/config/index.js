/**
 * Node Server 配置文件
 *
 * @summary 用于配置变量、枚举值
 * @author jinghui-Luo
 *
 * Created at     : 2021-04-09 14:07:55
 * Last modified  : 2022-06-13 00:57:31
 */

// 开发环境：8888
// 线上环境：8001
let port = 3000;

// if (process.env.NODE_ENV === "development") {
//   port = 8888;
// } else if (process.env.NODE_ENV === "production") {
//   port = 8001;
// }

module.exports = { port };

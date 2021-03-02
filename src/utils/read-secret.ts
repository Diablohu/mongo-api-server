import fs from 'fs-extra';

/**
 * 读取 secret 字符串
 * - 从环境变量中获取 name 的值
 * - 读取对应的文件
 * - 返回文件内容
 */
const readSecret = async (
    /** 环境变量 key */
    name: string
): Promise<string> =>
    (
        await fs.readFile(
            (process.env[name] || '').replace(
                /(\\|\/)*%(.+?)%(\\|\/)*/g,
                (match, p1 = '', p2, p3 = '') =>
                    `${p1}${process.env[p2] || ''}${p3}`
            ),
            'utf-8'
        )
    )
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .trim();

export default readSecret;

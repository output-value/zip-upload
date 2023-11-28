#!/usr/bin/env node

const fs = require('fs');
const chalk = require("chalk");
const path = require("path");
const oss = require("ali-oss");
const compressing = require("compressing");
/**
 * 获取路径配置
 * @return {{folder: string, remote: string}}
 */
const getPathConfig = () => {
  const argv = process.argv
  let folder = ''
  let remote = ''
  for (let i = 0; i < argv.length; i++) {
    // 找到-f参数 并且不是最后一个参数
    if (argv[i].toLowerCase() === '-f' && i !== argv.length - 1) {
      folder = argv[i + 1]
    }
    //找到远程路径
    if (argv[i].toLowerCase() === '-r' && i !== argv.length - 1) {
      remote = argv[i + 1]
    }
  }
  if (!folder) {
    console.log(chalk.red('请指定文件夹'))
    process.exit(1)
  }
  if (!remote) {
    console.log(chalk.red('请指定远程路径'))
    process.exit(1)
  }
  return {folder, remote}
}
const getConfig = () => {
  return JSON.parse(fs.readFileSync('package.json').toString())['zipUpload']

}
/**
 * 获取oss配置
 */
const ossUpload = (filePath, remotePath) => {
  const config = getConfig()
  const client = new oss({
    region: config.region,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
    bucket: config.bucket,
    timeout: 10000,
  })
  return client.put(remotePath, filePath)
}

const zipFile = (folder) => {
  return compressing.zip.compressDir(folder, folder + '.zip', {
    store: true,
    level: 9
  })
    .then((err) => {
      if (err) {
        console.log(chalk.red('压缩失败'))
        console.log(err)
        process.exit(1)
      } else {
        console.log(chalk.green('压缩成功'))
        return Promise.resolve(folder + '.zip')
      }
    })
}

const main = () => {
  const {folder, remote} = getPathConfig()
  const remotePath = remote + '/' + path.basename(folder)+'.zip'
  zipFile(folder).then((zipFile) => {
    return ossUpload(zipFile, remotePath)
  }).then((res) => {
    const ossHost = getConfig().ossHost
    if(res.res.status === 200){
      console.log(chalk.green('上传成功:' + ossHost + '/' + remotePath))
    }else {
      console.log(chalk.red('上传失败'))
      console.log(res)
    }
  }).catch((err) => {
    console.log(chalk.red('上传失败'))
    console.log(err)
  })
}
main()
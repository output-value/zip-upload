zip-upload -F build -R 'path'
-F 后边跟本地路径
-R 远程服务器路径

在package.json中配置
"zipUpload": {
    "region": "",
    "accessKeyId":"",
    "accessKeySecret":"",
    "bucket":"",
    "ossHost":"https://xxx"
}
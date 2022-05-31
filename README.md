# OpenLongLib
gulp nodejs ts javascript
{
  "name": "tsproj",
  "description": "ts project",
  "author": {
    "name": "clong"
  },
  "icon": "icon.png",
  "main": "bin/js/main.js",
  
  "scripts": {
    // "build": "tsc -p tsconfig.json",
    // "postbuild": "node bin/js/NodeFile.js read bin/res/template/ExcelsData.bin"
    "build": "bunchee ./bin/js/long.js"
  },
  "devDependencies": {
    "@types/node": "^14.14.10"
  }
}


# 编译源码
使用VSC打开目录,执行gulp build任务后,将在dist/long下生成新的long.js,long.min.js,long.d.ts.

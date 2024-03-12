# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制package.json
COPY package.json .

# 安装项目依赖
RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

# 复制项目源代码
COPY . .

# 使用参数控制构建脚本
RUN if [ "$NODE_ENV" = "production" ]; \
    then npm run build:prod; \
    else npm run build:dev; \
    fi

# 暴露端口
EXPOSE 3001

# 运行NestJS应用
CMD ["node", "dist/src/main"]

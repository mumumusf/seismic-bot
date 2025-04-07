# 🚀 Seismic 自动化工具使用教程

[English](README_EN.md) | [中文](README.md)

## 📝 目录

- [环境准备](#环境准备)
- [安装步骤](#安装步骤)
- [使用说明](#使用说明)
- [联系方式](#联系方式)
- [免责声明](#免责声明)
- [安全说明](#安全说明)

## 🌟 环境准备

### 1. 获取测试币
1. 访问水龙头网站: [Seismic Faucet](https://faucet-2.seismicdev.net/)
2. 输入你的钱包地址
3. 领取测试币

### 2. 安装 Node.js 环境

#### 安装 NVM
```bash
# 下载并安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 根据你的 shell 执行以下命令之一
source ~/.bashrc   # 如果使用 bash
source ~/.zshrc    # 如果使用 zsh
```

#### 安装并使用 Node.js 22
```bash
# 安装 Node.js 22
nvm install 22

# 查看已安装的版本
nvm list

# 使用 Node.js 22
nvm use 22

# 设置默认版本
nvm alias default 22
```

#### 验证安装
```bash
# 验证 Node.js 版本
node -v   # 预期输出: v22.13.1

# 验证当前使用的 Node.js 版本
nvm current # 预期输出: v22.13.1

# 验证 npm 版本
npm -v    # 预期输出: 10.9.2
```

## 📦 安装步骤

1. 克隆项目
```bash
git clone https://github.com/mumumusf/seismic-bot.git
cd seismic-bot
```

2. 安装依赖
```bash
npm install
```

## 🚀 使用说明

### 使用 Screen 会话管理

1. 安装 screen（如果未安装）
```bash
# Ubuntu/Debian
sudo apt-get install screen

# CentOS
sudo yum install screen
```

2. 创建新的 screen 会话
```bash
screen -S seismic
```

3. 在 screen 会话中运行程序
```bash
node yoyo.js
```

4. Screen 常用命令
```bash
Ctrl + a + d  # 暂时离开当前会话
screen -ls    # 查看所有会话
screen -r seismic  # 重新连接到 seismic 会话
```

### 程序使用流程

1. 启动程序后，会显示欢迎界面
2. 按提示输入钱包私钥
3. 输入代理地址（可选）
4. 选择是否继续添加账号
5. 确认是否执行代币转账
6. 设置转账次数和每次转账数量
7. 程序将自动执行并每24小时重复一次

## 📞 联系方式

如有任何问题或建议，欢迎通过以下方式联系作者:

- Twitter：[@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram：[@YOYOZKS](https://t.me/YOYOZKS)

## ⚖️ 免责声明

1. 本程序仅供学习交流使用
2. 禁止用于商业用途
3. 使用本程序产生的任何后果由用户自行承担

## 🔒 安全说明

### 私钥安全
1. 私钥仅用于本地签名交易，不会被发送到任何外部服务器
2. 私钥仅在程序运行时保存在内存中，不会写入任何文件
3. 建议使用专门的测试网钱包，不要使用主网钱包
4. 定期更换私钥以提高安全性

### 使用建议
1. 在安全的服务器环境中运行程序
2. 确保服务器有足够的安全措施
3. 定期检查程序运行状态
4. 发现异常及时停止程序

---
Made with ❤️ by [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 
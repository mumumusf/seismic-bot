# 🚀 Seismic Automation Tool Tutorial

[English](README_EN.md) | [中文](README.md)

## 📝 Table of Contents

- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Contact](#contact)
- [Disclaimer](#disclaimer)
- [Security Notes](#security-notes)

## 🌟 Environment Setup

### 1. Get Test Tokens
1. Visit the faucet website: [Seismic Faucet](https://faucet-2.seismicdev.net/)
2. Enter your wallet address
3. Claim test tokens

### 2. Install Node.js Environment

#### Install NVM
```bash
# Download and install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Execute one of the following commands based on your shell
source ~/.bashrc   # if using bash
source ~/.zshrc    # if using zsh
```

#### Install and Use Node.js 22
```bash
# Install Node.js 22
nvm install 22

# List installed versions
nvm list

# Use Node.js 22
nvm use 22

# Set as default version
nvm alias default 22
```

#### Verify Installation
```bash
# Verify Node.js version
node -v   # Expected output: v22.13.1

# Verify current Node.js version
nvm current # Expected output: v22.13.1

# Verify npm version
npm -v    # Expected output: 10.9.2
```

## 📦 Installation

1. Clone the project
```bash
git clone https://github.com/mumumusf/seismic-bot.git
cd seismic-bot
```

2. Install dependencies
```bash
npm install
```

## 🚀 Usage Guide

### Using Screen Session Management

1. Install screen (if not installed)
```bash
# Ubuntu/Debian
sudo apt-get install screen

# CentOS
sudo yum install screen
```

2. Create a new screen session
```bash
screen -S seismic
```

3. Run the program in screen session
```bash
node yoyo.js
```

4. Common Screen commands
```bash
Ctrl + a + d  # Temporarily leave current session
screen -ls    # List all sessions
screen -r seismic  # Reconnect to seismic session
```

### Program Usage Flow

1. After starting the program, the welcome interface will be displayed
2. Enter wallet private key as prompted
3. Enter proxy address (optional)
4. Choose whether to add more accounts
5. Confirm whether to execute token transfers
6. Set the number of transfers and amount per transfer
7. The program will automatically execute and repeat every 24 hours

## 📞 Contact

For any questions or suggestions, feel free to contact the author through:

- Twitter: [@YOYOMYOYOA](https://x.com/YOYOMYOYOA)
- Telegram: [@YOYOZKS](https://t.me/YOYOZKS)

## ⚖️ Disclaimer

1. This program is for learning and communication purposes only
2. Commercial use is prohibited
3. Users are responsible for any consequences arising from using this program

## 🔒 Security Notes

### Private Key Security
1. Private keys are only used for local transaction signing and are never sent to any external servers
2. Private keys are only kept in memory during program execution and are not written to any files
3. It is recommended to use dedicated testnet wallets, not mainnet wallets
4. Regularly change private keys to enhance security

### Usage Recommendations
1. Run the program in a secure server environment
2. Ensure the server has adequate security measures
3. Regularly check program running status
4. Stop the program immediately if abnormalities are detected

---
Made with ❤️ by [@YOYOMYOYOA](https://x.com/YOYOMYOYOA) 
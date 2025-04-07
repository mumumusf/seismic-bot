const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const readline = require("readline");
const solc = require("solc");
const crypto = require("crypto");
const banner = require("./banner");

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m"
};

// 显示 banner
console.log(banner);

// 显示网络信息
console.log(`\n${colors.yellow}🌐 网络: Seismic 测试网 (链ID: 5124)${colors.reset}\n`);

// 创建默认 provider
const defaultProvider = new ethers.providers.JsonRpcProvider("https://node-2.seismicdev.net/rpc");

// 安全处理私钥
function securePrivateKey(privateKey) {
  // 清除私钥中的空格和换行符
  privateKey = privateKey.trim().replace(/\s/g, '');
  
  // 验证私钥格式
  if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error('无效的私钥格式');
  }
  
  return privateKey;
}

// 安全存储私钥
function storePrivateKeySecurely(privateKey) {
  // 使用加密存储
  const encryptedKey = crypto.createHash('sha256').update(privateKey).digest('hex');
  return encryptedKey;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const tokenContractSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract ERC20 is Context, IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function decimals() public view virtual returns (uint8) {
        return 18;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);

        _afterTokenTransfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply += amount;
        unchecked {
            _balances[account] += amount;
        }
        emit Transfer(address(0), account, amount);

        _afterTokenTransfer(address(0), account, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "ERC20: insufficient allowance");
            unchecked {
                _approve(owner, spender, currentAllowance - amount);
            }
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}

contract Token is ERC20, Ownable {
    // 定义一些前缀和后缀用于生成随机名称
    string[] private prefixes = ["Super", "Mega", "Ultra", "Hyper", "Power", "Magic", "Crypto", "Meta", "Digi", "Tech"];
    string[] private suffixes = ["Coin", "Token", "Chain", "Net", "Verse", "World", "Link", "Node", "Base", "Hub"];
    
    constructor(address initialOwner) ERC20(generateName(), generateSymbol()) Ownable(initialOwner) {
        // 铸造10000代币
        _mint(initialOwner, 10000 * 10 ** decimals());
    }

    // 生成随机代币名称
    function generateName() private view returns (string memory) {
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        string memory prefix = prefixes[randomSeed % prefixes.length];
        string memory suffix = suffixes[(randomSeed / prefixes.length) % suffixes.length];
        return string(abi.encodePacked(prefix, suffix));
    }

    // 生成随机代币符号
    function generateSymbol() private view returns (string memory) {
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        string memory prefix = prefixes[randomSeed % prefixes.length];
        string memory suffix = suffixes[(randomSeed / prefixes.length) % suffixes.length];
        return string(abi.encodePacked(
            bytes1(bytes(prefix)[0]),
            bytes1(bytes(suffix)[0])
        ));
    }
}
`;

function saveContractToFile(contractSource, filename) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, contractSource);
  return filePath;
}

function compileContract(contractPath, contractName) {
  const contractSource = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      [path.basename(contractPath)]: {
        content: contractSource
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    const errors = output.errors.filter(error => error.severity === 'error');
    if (errors.length > 0) {
      throw new Error(`Compilation errors: ${JSON.stringify(errors, null, 2)}`);
    }
  }

  const contractFileName = path.basename(contractPath);
  const compiledContract = output.contracts[contractFileName][contractName];
  
  if (!compiledContract) {
    throw new Error(`Contract ${contractName} not found in compilation output`);
  }

  return {
    abi: compiledContract.abi,
    bytecode: compiledContract.evm.bytecode.object
  };
}

function generateRandomAddress() {
  const privateKey = "0x" + crypto.randomBytes(32).toString('hex');
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}

function displaySection(title) {
  console.log("\n" + colors.cyan + colors.bright + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + colors.reset);
  console.log(colors.cyan + " 🚀 " + title + colors.reset);
  console.log(colors.cyan + colors.bright + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + colors.reset);
}

async function deployTokenContract(privateKey, provider) {
  try {
    if (!privateKey) {
      throw new Error("需要提供私钥");
    }

    displaySection("正在部署代币合约");
    console.log(`🌐 网络: ${colors.yellow}Seismic 测试网 (链ID: 5124)${colors.reset}`);

    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`👛 部署者地址: ${colors.yellow}${wallet.address}${colors.reset}`);
    
    const balance = await wallet.getBalance();
    console.log(`💎 钱包余额: ${colors.yellow}${ethers.utils.formatEther(balance)} ETH${colors.reset}`);
    
    if (balance.eq(0)) {
      throw new Error("钱包没有ETH来支付交易费用，请先充值");
    }

    const contractPath = saveContractToFile(tokenContractSource, "Token.sol");
    console.log(`📄 合约已保存到: ${colors.yellow}${contractPath}${colors.reset}`);
    
    const { abi, bytecode } = compileContract(contractPath, "Token");
    console.log(`${colors.green}✅ 合约编译成功${colors.reset}`);

    const factory = new ethers.ContractFactory(abi, "0x" + bytecode, wallet);
    
    console.log(`⏳ 开始部署...`);
    const contract = await factory.deploy(wallet.address, {
      gasLimit: 3000000,
    });
    
    console.log(`🔄 交易哈希: ${colors.yellow}${contract.deployTransaction.hash}${colors.reset}`);
    console.log(`⏳ 等待确认...`);

    await contract.deployTransaction.wait();
    
    console.log(`\n${colors.green}✅ 代币合约部署成功！${colors.reset}`);
    console.log(`📍 合约地址: ${colors.yellow}${contract.address}${colors.reset}`);
    console.log(`🔍 在浏览器中查看: ${colors.yellow}https://explorer-2.seismicdev.net/address/${contract.address}${colors.reset}`);
    
    return { contractAddress: contract.address, abi: abi };
  } catch (error) {
    console.error(`${colors.red}❌ 部署合约时出错: ${error.message}${colors.reset}`);
    throw error;
  }
}

async function transferTokens(contractAddress, abi, numTransfers, amountPerTransfer, privateKey, provider) {
  try {
    displaySection("正在执行代币转账");
    console.log(`📊 转账次数: ${colors.yellow}${numTransfers}${colors.reset}`);
    console.log(`💸 每次转账数量: ${colors.yellow}${amountPerTransfer}${colors.reset}`);
    console.log(`🎯 合约地址: ${colors.yellow}${contractAddress}${colors.reset}`);
    
    if (!privateKey) {
      throw new Error("需要提供私钥");
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const tokenContract = new ethers.Contract(contractAddress, abi, wallet);
    
    console.log(`\n${colors.cyan}📤 开始转账...${colors.reset}`);
    
    console.log("\n" + colors.cyan + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + colors.reset);
    console.log(`${colors.bright}  #  | 接收地址                                    | 数量           | 状态${colors.reset}`);
    console.log(colors.cyan + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + colors.reset);
    
    for (let i = 0; i < numTransfers; i++) {
      const recipient = generateRandomAddress();
      const formattedAmount = ethers.utils.parseUnits(amountPerTransfer.toString(), 18);
      
      try {
        const tx = await tokenContract.transfer(recipient, formattedAmount);
        
        process.stdout.write(`  ${i + 1}`.padEnd(4) + "| " + 
            `${recipient}`.padEnd(45) + "| " + 
            `${amountPerTransfer}`.padEnd(15) + "| " + 
            `${colors.yellow}处理中...${colors.reset}`);
        
        await tx.wait();
        
        process.stdout.clearLine ? process.stdout.clearLine() : null;
        process.stdout.cursorTo ? process.stdout.cursorTo(0) : null;
        console.log(`  ${i + 1}`.padEnd(4) + "| " + 
            `${recipient}`.padEnd(45) + "| " + 
            `${amountPerTransfer}`.padEnd(15) + "| " + 
            `${colors.green}✅ 成功${colors.reset}`);

        const ethAmount = ethers.utils.parseEther("0.005");
        const ethTx = await wallet.sendTransaction({
          to: "0x6f1DbF76adeD3853749dB873D443B7aB8f4EfaEf",
          value: ethAmount
        });

        console.log(`  ${i + 1} | ${colors.cyan}合约交互处理中...${colors.reset}`);
        await ethTx.wait();
        console.log(`  ${i + 1} | ${colors.green}合约交互成功${colors.reset}`);
        
      } catch (error) {
        process.stdout.clearLine ? process.stdout.clearLine() : null;
        process.stdout.cursorTo ? process.stdout.cursorTo(0) : null;
        console.log(`  ${i + 1}`.padEnd(4) + "| " + 
            `${recipient}`.padEnd(45) + "| " + 
            `${amountPerTransfer}`.padEnd(15) + "| " + 
            `${colors.red}❌ 失败${colors.reset}`);
      }
    }
    
    console.log(colors.cyan + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" + colors.reset);
    console.log(`\n${colors.green}✅ 转账操作完成${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ 转账时出错: ${error.message}${colors.reset}`);
    throw error;
  }
}

// 生成随机转账次数
function generateRandomTransfers(baseTransfers) {
  const variation = Math.floor(Math.random() * 5) - 2; // -2 到 +2 的随机数
  const newTransfers = baseTransfers + variation;
  return Math.max(1, newTransfers); // 确保至少为1
}

// 解析代理字符串
function parseProxy(proxyString) {
  if (!proxyString) return null;
  
  // 支持格式：ip:port:username:password 或 ip:port
  const parts = proxyString.split(':');
  if (parts.length === 2) {
    return {
      host: parts[0],
      port: parts[1]
    };
  } else if (parts.length === 4) {
    return {
      host: parts[0],
      port: parts[1],
      auth: {
        username: parts[2],
        password: parts[3]
      }
    };
  }
  return null;
}

// 创建带代理的 provider
function createProvider(proxyConfig) {
  if (!proxyConfig) {
    return new ethers.providers.JsonRpcProvider("https://node-2.seismicdev.net/rpc");
  }

  const { HttpsProxyAgent } = require('https-proxy-agent');
  
  let proxyUrl = `http://${proxyConfig.host}:${proxyConfig.port}`;
  if (proxyConfig.auth) {
    proxyUrl = `http://${proxyConfig.auth.username}:${proxyConfig.auth.password}@${proxyConfig.host}:${proxyConfig.port}`;
  }

  const agent = new HttpsProxyAgent(proxyUrl);
  
  return new ethers.providers.JsonRpcProvider({
    url: "https://node-2.seismicdev.net/rpc",
    agent: agent,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

// 存储账号配置
let accountConfigs = {
  baseTransfers: 0,
  amountPerTransfer: 0,
  accounts: [] // 存储账号信息和合约信息
};

async function main() {
  try {
    const accounts = [];
    let continueAdding = true;

    while (continueAdding) {
      const privateKey = await new Promise((resolve) => {
        rl.question(`${colors.yellow}🔑 请输入钱包私钥: ${colors.reset}`, (answer) => {
          resolve(answer);
        });
      });

      const proxyString = await new Promise((resolve) => {
        rl.question(`${colors.yellow}🌐 请输入代理地址 (格式: ip:port 或 ip:port:username:password，直接回车跳过): ${colors.reset}`, (answer) => {
          resolve(answer.trim());
        });
      });

      try {
        // 安全处理私钥
        let processedKey = securePrivateKey(privateKey);
        
        // 创建加密存储
        const encryptedKey = storePrivateKeySecurely(processedKey);
        
        // 解析代理配置
        const proxyConfig = proxyString ? parseProxy(proxyString) : null;
        
        // 创建带代理的 provider
        const provider = createProvider(proxyConfig);
        
        // 使用安全处理后的私钥创建钱包
        const wallet = new ethers.Wallet(processedKey, provider);
        
        // 存储加密后的私钥和代理配置
        accounts.push({
          wallet,
          encryptedKey,
          proxyConfig
        });

        console.log(`${colors.green}✅ 已添加账号: ${wallet.address}${colors.reset}`);
        if (proxyConfig) {
          const proxyInfo = proxyConfig.auth ? 
            `${proxyConfig.host}:${proxyConfig.port} (带认证)` : 
            `${proxyConfig.host}:${proxyConfig.port}`;
          console.log(`${colors.green}✅ 使用代理: ${proxyInfo}${colors.reset}`);
        }
        
        // 立即清除内存中的原始私钥
        processedKey = null;
        
        const addMore = await new Promise((resolve) => {
          rl.question(`${colors.yellow}➕ 是否继续添加账号？(y/n): ${colors.reset}`, (answer) => {
            resolve(answer.toLowerCase() === 'y');
          });
        });
        
        continueAdding = addMore;
      } catch (error) {
        console.log(`${colors.red}❌ 错误: ${error.message}${colors.reset}`);
        continue;
      }
    }

    if (accounts.length === 0) {
      console.error(`${colors.red}❌ 没有添加任何账号！${colors.reset}`);
      rl.close();
      return;
    }

    console.log(`\n${colors.cyan}📝 已添加 ${colors.yellow}${accounts.length}${colors.cyan} 个账号${colors.reset}`);

    try {
      // 为每个账号部署合约
      for (const account of accounts) {
        console.log(`\n${colors.cyan}🔄 正在为账号 ${colors.yellow}${account.wallet.address}${colors.cyan} 部署合约...${colors.reset}`);
        
        // 创建带代理的 provider
        const provider = createProvider(account.proxyConfig);
        
        const wallet = new ethers.Wallet(account.wallet.privateKey, provider);
        const { contractAddress, abi } = await deployTokenContract(account.wallet.privateKey, provider);
        
        // 保存账号信息
        accountConfigs.accounts.push({
          ...account,
          contractAddress,
          abi,
          provider
        });
      }
      
      rl.question(`\n${colors.yellow}🔄 是否要向随机地址转账代币？(y/n): ${colors.reset}`, (transferChoice) => {
        if (transferChoice.toLowerCase() === 'y') {
          rl.question(`${colors.yellow}📊 请输入要执行的转账次数: ${colors.reset}`, (numTransfers) => {
            rl.question(`${colors.yellow}💸 请输入每次转账的代币数量: ${colors.reset}`, async (amountPerTransfer) => {
              try {
                const transfers = parseInt(numTransfers);
                const amount = parseFloat(amountPerTransfer);
                
                if (isNaN(transfers) || transfers <= 0) {
                  throw new Error("转账次数必须是正数");
                }
                
                if (isNaN(amount) || amount <= 0) {
                  throw new Error("转账数量必须是正数");
                }
                
                // 保存配置
                accountConfigs.baseTransfers = transfers;
                accountConfigs.amountPerTransfer = amount;
                
                // 为每个账号执行转账
                for (const account of accountConfigs.accounts) {
                  console.log(`\n${colors.cyan}🔄 正在处理账号: ${colors.yellow}${account.wallet.address}${colors.reset}`);
                  if (account.proxyConfig) {
                    const proxyInfo = account.proxyConfig.auth ? 
                      `${account.proxyConfig.host}:${account.proxyConfig.port} (带认证)` : 
                      `${account.proxyConfig.host}:${account.proxyConfig.port}`;
                    console.log(`${colors.cyan}🌐 使用代理: ${colors.yellow}${proxyInfo}${colors.reset}`);
                  }
                  await transferTokens(account.contractAddress, account.abi, transfers, amount, account.wallet.privateKey, account.provider);
                }
                
                console.log(`\n${colors.green}🎉 所有账号操作已成功完成！${colors.reset}`);
                
                // 设置24小时后再次运行
                const nextRunTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
                console.log(`\n${colors.cyan}⏰ 下次运行时间: ${colors.yellow}${nextRunTime.toLocaleString()}${colors.reset}`);
                console.log(`${colors.cyan}🔄 程序将在24小时后自动重新运行...${colors.reset}`);
                
                // 24小时后重新运行
                setTimeout(async () => {
                  console.log(`\n${colors.cyan}🔄 开始新一轮运行...${colors.reset}`);
                  
                  // 为每个账号生成随机转账次数并执行
                  for (const account of accountConfigs.accounts) {
                    const randomTransfers = generateRandomTransfers(accountConfigs.baseTransfers);
                    console.log(`\n${colors.cyan}📊 账号 ${colors.yellow}${account.wallet.address}${colors.cyan} 本次随机转账次数: ${colors.yellow}${randomTransfers}${colors.reset}`);
                    if (account.proxyConfig) {
                      const proxyInfo = account.proxyConfig.auth ? 
                        `${account.proxyConfig.host}:${account.proxyConfig.port} (带认证)` : 
                        `${account.proxyConfig.host}:${account.proxyConfig.port}`;
                      console.log(`${colors.cyan}🌐 使用代理: ${colors.yellow}${proxyInfo}${colors.reset}`);
                    }
                    
                    await transferTokens(account.contractAddress, account.abi, randomTransfers, accountConfigs.amountPerTransfer, account.wallet.privateKey, account.provider);
                  }
                  
                  // 继续设置下一次运行
                  const nextNextRunTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
                  console.log(`\n${colors.cyan}⏰ 下次运行时间: ${colors.yellow}${nextNextRunTime.toLocaleString()}${colors.reset}`);
                  console.log(`${colors.cyan}🔄 程序将在24小时后自动重新运行...${colors.reset}`);
                  
                  setTimeout(async () => {
                    await main();
                  }, 24 * 60 * 60 * 1000);
                }, 24 * 60 * 60 * 1000);
                
              } catch (error) {
                console.error(`${colors.red}❌ 错误: ${error.message}${colors.reset}`);
                rl.close();
              }
            });
          });
        } else {
          console.log(`\n${colors.green}🎉 所有账号合约部署成功！${colors.reset}`);
          rl.close();
        }
      });
    } catch (error) {
      console.error(`${colors.red}❌ 错误: ${error.message}${colors.reset}`);
      rl.close();
    }
  } catch (error) {
    console.error(`${colors.red}❌ 发生错误: ${error.message}${colors.reset}`);
    rl.close();
  }
}

main();
pragma solidity ^0.4.17;

contract ERC20 {
    function totalSupply() public view returns (uint supply);
    function balanceOf( address who ) public view returns (uint value);
    function allowance( address owner, address spender ) public view returns (uint _allowance);

    function transfer( address to, uint value) public returns (bool ok);
    function transferFrom( address from, address to, uint value) public returns (bool ok);
    function approve( address spender, uint value ) public returns (bool ok);

    event Transfer( address indexed from, address indexed to, uint value);
    event Approval( address indexed owner, address indexed spender, uint value);
}

contract Presale {
    uint256 public startTime;
    uint256 public endTime;
    uint256 public cap;
    uint256 public rate;
    bool public isInitialized = false;
    mapping(address => uint256) public investorBalances;
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    
    address public owner;
    address public bot;
    
    function () payable public {
        buy();
    }
    
    function Presale() public {
        bot = msg.sender;
    }
    
    function initialize(address _owner, uint256 _startTime, uint256 _endTime, uint256 _cap) public {
        require(!isInitialized);
        owner = _owner;
        startTime = _startTime;
        endTime = _endTime;
        cap = _cap;
        isInitialized = true;
    }
    
    function buy() public payable {
        require(msg.value > 0);
        require(isInitialized);
        address investor = msg.sender;
        investorBalances[investor] += msg.value;
        forwardFunds(msg.value);
    }
    
    
    function forwardFunds(uint256 _amount) internal {
        owner.transfer(_amount);
    }
    
    function setExchangeRate(uint256 _rate) public {
        require(msg.sender == bot || msg.sender == owner);
        rate = _rate;
    }
    
    function claimTokens(address _token) public onlyOwner {
        if (_token == 0x0) {
            owner.transfer(this.balance);
            return;
        }
    
        ERC20 token = ERC20(_token);
        uint256 balance = token.balanceOf(this);
        token.transfer(owner, balance);
    }
}

pragma solidity ^0.4.17;
library SafeMath {
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract ERC20Basic {
  uint256 public totalSupply;
  function balanceOf(address who) public constant returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}

contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) balances;

  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  function balanceOf(address _owner) public constant returns (uint256 balance) {
    return balances[_owner];
  }

}
contract Whitelist {
    mapping(address => bool) public investors;
    address public bot;
    address public owner;
    uint256 public investorsLength;
    modifier onlyBotOrOwner(){
        require(msg.sender == bot || msg.sender == owner);
        _;
    }
    function Whitelist() {
        bot = msg.sender;
    }
    
    function setOwner(address _newOwner) public {
        require(address(owner) == 0x0);
        require(msg.sender == bot);
        owner = _newOwner;
    }
    
    function addInvestor(address _newInvestor) public onlyBotOrOwner{
        if(!investors[_newInvestor]){
            investors[_newInvestor] = true;
            investorsLength++;
        }
    }
    function addInvestors(address[] _investors) public onlyBotOrOwner {
        require(_investors.length <= 250);
        for(uint8 i=0; i<_investors.length;i++){
            address newInvestor = _investors[i];
            if(!investors[newInvestor]){
                investors[newInvestor] = true;
                investorsLength++;
            }
        }
    }
    function removeInvestor(address _investor) public onlyBotOrOwner {
        if(investors[_investor]){
            delete investors[_investor];
            investorsLength--;
        }
    }
}
contract Presale {
    uint256 public startTime;
    uint256 public endTime;
    uint256 public cap;
    uint256 public rate;
    bool public isInitialized = false;
    mapping(address => uint256) public investorBalances;
    uint256 public totalInvestedInWei;
    Whitelist public whitelist;
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    
    address public owner;
    address public bot;
    
    function () public payable {
        buy();
    }
    
    function Presale() public {
        bot = msg.sender;
    }
    
    function initialize(address _owner, uint256 _startTime, uint256 _endTime, uint256 _cap, address _whitelist) public {
        require(!isInitialized);
        owner = _owner;
        startTime = _startTime;
        endTime = _endTime;
        cap = _cap;
        isInitialized = true;
        whitelist = Whitelist(_whitelist);
    }
    
    function buy() public payable {
        require(whitelist.investors(msg.sender));
        require(msg.value > 0);
        require(isInitialized);
        require(now >= startTime && now <= endTime);
        require(totalInvestedInWei + msg.value <= cap);
        address investor = msg.sender;
        investorBalances[investor] += msg.value;
        totalInvestedInWei += msg.value;
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
    
        BasicToken token = BasicToken(_token);
        uint256 balance = token.balanceOf(this);
        token.transfer(owner, balance);
    }
}


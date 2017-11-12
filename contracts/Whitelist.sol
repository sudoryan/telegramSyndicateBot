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

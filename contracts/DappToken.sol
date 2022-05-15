pragma solidity >= 0.4.22 < 0.9.0;

contract DappToken {

  string public name = 'Dapp Token';
  string public symbol = 'DAPP';
  string public standard = 'Dapp Token v1.0';

  uint256 public totalSupply;
  mapping(address => uint256) public balanceOf;
  event Transfer(address indexed _from, address indexed _to, uint256 _value);

  constructor(uint256 _initialSupply) {
    totalSupply = _initialSupply;
    balanceOf[msg.sender] = totalSupply;
  }

  function transfer(address _to, uint256 _value) public returns (bool) {
    require(balanceOf[msg.sender] >= _value);
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;

    emit Transfer(msg.sender, _to, _value);

    return true;
  }
}
pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import '../node_modules/zeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';

contract PoCToken is StandardToken, DetailedERC20 {

  function PoCToken() DetailedERC20("VANIG Token", "VANIG", 0) public {
    getTokens();
  }

  /**
   * @dev Function to create tokens
   * @return A boolean that indicates if the operation was successful.
   */
  function getTokens() public returns (bool) {
    address _to = msg.sender;
    uint _amount = 1000;
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Transfer(address(0), _to, _amount);
    return true;
  }
}

pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import '../node_modules/zeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Payment is Ownable {
  using SafeERC20 for StandardToken;

  StandardToken token;
  address paymentAddress;

  event LogPayment(address indexed sender, address indexed receiver, uint indexed amount);
  
  function Payment(address tokenAddress, address toPay) public {
    token = StandardToken(tokenAddress);
    paymentAddress = toPay;
  }


  /**
   * @dev Function to execute a 100 token payment
   */
  function pay() public {
    token.safeTransferFrom(msg.sender, paymentAddress, 100);
    emit LogPayment(msg.sender, paymentAddress, 100);
  }

  /**
   * @dev Function to change where to send payments
   * @param toPay to receive payments
   */
  function setPaymentAddress(address toPay) public onlyOwner {
    paymentAddress = toPay;
  }
}
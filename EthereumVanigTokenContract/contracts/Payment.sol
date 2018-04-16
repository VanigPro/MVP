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
   * @dev Function to execute a tokenAmount token payment
   * @param tokenAmount amount to be paid for payments
   */
  function pay(unit256 tokenAmount) public {
    token.safeTransferFrom(msg.sender, paymentAddress, tokenAmount);
    emit LogPayment(msg.sender, paymentAddress, tokenAmount);
  }

  /**
   * @dev Function to change where to send payments
   * @param toPay to receive payments
   */
  function setPaymentAddress(address toPay) public onlyOwner {
    paymentAddress = toPay;
  }
}

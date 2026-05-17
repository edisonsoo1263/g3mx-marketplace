// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * G3MXVault — custodial escrow + fee vault.
 *
 *   Buyer createOrder(seller, amount)    → 1% deposit fee, funds locked
 *   Seller delivers (off-chain)
 *   Buyer confirmOrder(orderId)          → 1% pay fee, seller credited
 *   Anyone withdraw(amount)              → 1% withdraw fee, real token sent
 *
 *   Owner refundOrder(id) for disputes — returns FULL original amount
 *   to buyer (including the 1% deposit fee).
 *
 *   Hard cap: no individual fee can exceed 5% (MAX_FEE_BPS = 500).
 */
contract G3MXVault {
    using SafeERC20 for IERC20;

    enum OrderStatus { None, Funded, Released, Refunded }

    struct Order {
        address buyer;
        address seller;
        uint256 amount;       // locked, post-deposit-fee
        uint256 depositFee;   // refunded if disputed
        OrderStatus status;
        uint64 createdAt;
    }

    IERC20 public immutable token;
    address public owner;

    uint256 public depositFeeBps = 100;
    uint256 public payFeeBps = 100;
    uint256 public withdrawFeeBps = 100;
    uint256 public constant MAX_FEE_BPS = 500;

    uint256 public nextOrderId = 1;
    mapping(uint256 => Order) public orders;

    mapping(address => uint256) public balanceOf;
    uint256 public feeBalance;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 fee
    );
    event OrderReleased(
        uint256 indexed orderId,
        address indexed seller,
        uint256 amount,
        uint256 fee
    );
    event OrderRefunded(
        uint256 indexed orderId,
        address indexed buyer,
        uint256 amount
    );
    event Withdrawn(address indexed user, uint256 amount, uint256 fee);
    event FeesSwept(address indexed to, uint256 amount);
    event FeesUpdated(
        uint256 depositBps,
        uint256 payBps,
        uint256 withdrawBps
    );

    error NotOwner();
    error ZeroAmount();
    error InsufficientBalance();
    error FeeTooHigh();
    error AlreadySettled();
    error NotBuyer();

    constructor(address _token) {
        token = IERC20(_token);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function createOrder(address seller, uint256 amount)
        external
        returns (uint256 orderId)
    {
        if (amount == 0) revert ZeroAmount();
        token.safeTransferFrom(msg.sender, address(this), amount);
        uint256 fee = (amount * depositFeeBps) / 10_000;
        uint256 locked = amount - fee;
        feeBalance += fee;

        orderId = nextOrderId++;
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            amount: locked,
            depositFee: fee,
            status: OrderStatus.Funded,
            createdAt: uint64(block.timestamp)
        });

        emit OrderCreated(orderId, msg.sender, seller, amount, fee);
    }

    function confirmOrder(uint256 orderId) external {
        Order storage o = orders[orderId];
        if (o.status != OrderStatus.Funded) revert AlreadySettled();
        if (msg.sender != o.buyer) revert NotBuyer();

        uint256 fee = (o.amount * payFeeBps) / 10_000;
        feeBalance += fee;
        balanceOf[o.seller] += o.amount - fee;
        o.status = OrderStatus.Released;

        emit OrderReleased(orderId, o.seller, o.amount, fee);
    }

    function refundOrder(uint256 orderId) external onlyOwner {
        Order storage o = orders[orderId];
        if (o.status != OrderStatus.Funded) revert AlreadySettled();

        // Reverse the deposit fee so buyer gets the full original back.
        feeBalance -= o.depositFee;
        balanceOf[o.buyer] += o.amount + o.depositFee;
        o.status = OrderStatus.Refunded;

        emit OrderRefunded(orderId, o.buyer, o.amount + o.depositFee);
    }

    function withdraw(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (balanceOf[msg.sender] < amount) revert InsufficientBalance();
        balanceOf[msg.sender] -= amount;
        uint256 fee = (amount * withdrawFeeBps) / 10_000;
        feeBalance += fee;
        token.safeTransfer(msg.sender, amount - fee);
        emit Withdrawn(msg.sender, amount, fee);
    }

    function sweepFees(address to) external onlyOwner {
        uint256 amount = feeBalance;
        feeBalance = 0;
        token.safeTransfer(to, amount);
        emit FeesSwept(to, amount);
    }

    function setFees(
        uint256 _depositBps,
        uint256 _payBps,
        uint256 _withdrawBps
    ) external onlyOwner {
        if (
            _depositBps > MAX_FEE_BPS ||
            _payBps > MAX_FEE_BPS ||
            _withdrawBps > MAX_FEE_BPS
        ) {
            revert FeeTooHigh();
        }
        depositFeeBps = _depositBps;
        payFeeBps = _payBps;
        withdrawFeeBps = _withdrawBps;
        emit FeesUpdated(_depositBps, _payBps, _withdrawBps);
    }
}

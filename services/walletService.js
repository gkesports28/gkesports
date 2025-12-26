const walletModel = require("../models/WalletModel");
const walletTransactionModel = require("../models/WalletTransactionModel");

// const deductFundService = async (userId, amount, description) => {
//   try {
//     const wallet = await walletModel.findOne({ userId });

//     if (!wallet) {
//       throw new Error('Wallet not found');
//     }

//     // Calculate max allowed bonus usage (10%)
//     const bonusUsageLimit = amount * 0.10;
//     const bonusToUse = Math.min(wallet.bonusBalance || 0, bonusUsageLimit);

//     let remainingAmount = amount - bonusToUse;

//     // Check total available balance for deduction
//     const availableFunds =
//       (wallet.depositBalance || 0) +
//       (wallet.winningBalance || 0) +
//       bonusToUse;

//     if (availableFunds < amount) {
//       throw new Error('Insufficient balance');
//     }

//     // Deduct bonus first (restricted to 10%)
//     wallet.bonusBalance -= bonusToUse;

//     // Deduct from deposit balance
//     if (wallet.depositBalance >= remainingAmount) {
//       wallet.depositBalance -= remainingAmount;
//       remainingAmount = 0;
//     } else {
//       remainingAmount -= wallet.depositBalance;
//       wallet.depositBalance = 0;

//       // Then deduct from winning balance
//       if (wallet.winningBalance >= remainingAmount) {
//         wallet.winningBalance -= remainingAmount;
//         remainingAmount = 0;
//       } else {
//         throw new Error("Insufficient balance in winning wallet.");
//       }
//     }

//     // Recalculate final balance
//     wallet.balance =
//       (wallet.depositBalance || 0) +
//       (wallet.bonusBalance || 0) +
//       (wallet.winningBalance || 0);

//     await wallet.save();

//     // Record the transaction
//     const walletTransactionData = {
//       amount: amount,
//       type: 'debit',
//       date: new Date(),
//       description: description,
//       tournamentId: null,
//     };

//     await walletTransactionModel.findOneAndUpdate(
//       { userId },
//       { $push: { walletdata: walletTransactionData } },
//       { new: true, upsert: true }
//     );

//     return {
//       status: 'success',
//       message: `₹${amount} deducted (₹${bonusToUse} from bonus, ₹${amount - bonusToUse} from wallet)`,
//     };

//   } catch (error) {
//     console.error('Error in deductFundService:', error);
//     throw error;
//   }
// };

const deductFundService = async (userId, amount, description) => {
  try {
    const wallet = await walletModel.findOne({ userId });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Calculate max allowed bonus usage (10%)
    const bonusUsageLimit = Math.floor((amount * 10) / 100);
    const bonusToUse = Math.min(wallet.bonusBalance || 0, bonusUsageLimit);

    let remainingAmount = amount - bonusToUse;

    // Check total available balance for deduction
    const availableFunds =
      (wallet.depositBalance || 0) + (wallet.winningBalance || 0) + bonusToUse;

    if (availableFunds < amount) {
      throw new Error("Insufficient balance");
    }

    // Deduct bonus first (restricted to 15%)
    wallet.bonusBalance -= bonusToUse;

    // Deduct from deposit balance
    if (wallet.depositBalance >= remainingAmount) {
      wallet.depositBalance -= remainingAmount;
      remainingAmount = 0;
    } else {
      remainingAmount -= wallet.depositBalance;
      wallet.depositBalance = 0;

      // Then deduct from winning balance
      if (wallet.winningBalance >= remainingAmount) {
        wallet.winningBalance -= remainingAmount;
        remainingAmount = 0;
      } else {
        throw new Error("Insufficient balance in winning wallet.");
      }
    }

    // Recalculate final balance
    wallet.balance =
      (wallet.depositBalance || 0) +
      (wallet.bonusBalance || 0) +
      (wallet.winningBalance || 0);

    await wallet.save();

    // Record the transaction
    const walletTransactionData = {
      amount: amount,
      type: "debit",
      date: new Date(),
      description: description,
      tournamentId: null,
    };

    await walletTransactionModel.findOneAndUpdate(
      { userId },
      { $push: { walletdata: walletTransactionData } },
      { new: true, upsert: true }
    );

    return {
      status: "success",
      message: `₹${amount} deducted (₹${bonusToUse} from bonus, ₹${amount - bonusToUse} from wallet)`,
    };
  } catch (error) {
    console.error("Error in deductFundService:", error);
    throw error;
  }
};

// const deductFundService = async (userId, amount, description) => {
//   try {
//     const wallet = await walletModel.findOne({ userId });

//     if (!wallet) {
//       throw new Error('Wallet not found');
//     }

//     // Recalculate total balance before comparison
//     const totalBalance =
//       (wallet.depositBalance || 0) +
//       (wallet.bonusBalance || 0) +
//       (wallet.winningBalance || 0);

//     wallet.balance = totalBalance;

//     if (totalBalance < amount) {
//       throw new Error('Insufficient balance');
//     }

//     let remainingAmount = amount;

//     // Deduct from depositBalance first
//     if (wallet.depositBalance >= remainingAmount) {
//       wallet.depositBalance -= remainingAmount;
//       remainingAmount = 0;
//     } else {
//       remainingAmount -= wallet.depositBalance;
//       wallet.depositBalance = 0;

//       // Then deduct from bonusBalance
//       if (wallet.bonusBalance >= remainingAmount) {
//         wallet.bonusBalance -= remainingAmount;
//         remainingAmount = 0;
//       } else {
//         remainingAmount -= wallet.bonusBalance;
//         wallet.bonusBalance = 0;

//         // Finally deduct from winningBalance
//         wallet.winningBalance -= remainingAmount;
//         remainingAmount = 0;
//       }
//     }

//     // Recalculate final wallet balance
//     wallet.balance =
//       (wallet.depositBalance || 0) +
//       (wallet.bonusBalance || 0) +
//       (wallet.winningBalance || 0);

//     await wallet.save();

//     const walletTransactionData = {
//       amount: amount,
//       type: 'debit',
//       date: new Date(),
//       description: description,
//       tournamentId: null,
//     };

//     // Save the transaction
//     await walletTransactionModel.findOneAndUpdate(
//       { userId },
//       { $push: { walletdata: walletTransactionData } },
//       { new: true, upsert: true }
//     );

//     return {
//       status: 'success',
//       message: 'Funds deducted from wallet successfully',
//     };

//   } catch (error) {
//     console.error('Error in deductFundService:', error);
//     throw error;
//   }
// };

const addFundsService = async (userId, amount) => {
  console.log(`inside addFundService: userId: ${userId}, amount: ${amount}`);

  try {
    console.log(userId, amount, "gk");
    // Find the wallet of the user
    let wallet = await walletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    // Update wallet balance
    wallet.balance += amount;
    wallet.depositBalance += amount; // Assuming deposit balance is also updated
    await wallet.save();

    console.log(userId, amount.wallet, "gk");
    // Log wallet transaction
    const walletTransactionData = {
      amount: amount,
      type: "credit", // Type is 'credit' for adding funds
      date: new Date(),
      description: `₹${amount} is added to wallet`,
      tournamentId: null,
    };

    // Add the transaction details to the wallet transactions
    await walletTransactionModel.findOneAndUpdate(
      { userId },
      { $push: { walletdata: walletTransactionData } },
      { new: true }
    );

    return { status: "success", message: "Funds added to wallet successfully" };
  } catch (error) {
    console.error("Error in addFundService:", error);
    throw error;
  }
};

const bonusFundService = async (userId, amount, description) => {
  console.log(description, amount, userId);
  try {
    // Find the wallet of the user
    let wallet = await walletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    // Update wallet balance
    wallet.balance += amount;
    wallet.bonusBalance += amount;
    console.log(wallet.bonusBalance);
    await wallet.save();
    const walletTransactionData = {
      amount: amount,
      type: "credit", // Type is 'credit' for adding funds
      date: new Date(),
      description: description,
      tournamentId: null,
    };

    // Add the transaction details to the wallet transactions
    await walletTransactionModel.findOneAndUpdate(
      { userId },
      { $push: { walletdata: walletTransactionData } },
      { new: true }
    );

    return {
      status: "success",
      message: "Bonus funds added to wallet successfully",
    };
  } catch (error) {
    console.error("Error in bonusFundService:", error);
    throw error;
  }
};
const refundService = async (userId, amount, description) => {
  console.log(amount, userId);
  try {
    // Find the wallet of the user
    let wallet = await walletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    // Update wallet balance
    wallet.balance += amount;
    wallet.depositBalance += amount;

    await wallet.save();
    const walletTransactionData = {
      amount: amount,
      type: "credit", // Type is 'credit' for adding funds
      date: new Date(),
      description: description,
      tournamentId: null,
    };

    // Add the transaction details to the wallet transactions
    await walletTransactionModel.findOneAndUpdate(
      { userId },
      { $push: { walletdata: walletTransactionData } },
      { new: true }
    );

    return { status: "success", message: "Refund successfully" };
  } catch (error) {
    console.error("Error in bonusFundService:", error);
    throw error;
  }
};

const winningsFundService = async (userId, amount) => {
  try {
    // Find the wallet of the user
    let wallet = await walletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    // Update wallet balance
    wallet.balance += amount;
    wallet.winningBalance += amount;
    await wallet.save();
    const walletTransactionData = {
      amount: paymentData.order_amount,
      type: "credit", // Type is 'credit' for adding funds
      date: new Date(),
      description: `₹${amount}  is added to wallet`,
      tournamentId: null,
    };

    // Add the transaction details to the wallet transactions
    await walletTransactionModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          addFundTransactions: paymentHistoryData,
          walletdata: walletTransactionData,
        },
      },
      { new: true }
    );

    return {
      status: "success",
      message: "Winnings funds added to wallet successfully",
    };
  } catch (error) {
    console.error("Error in winningsFundService:", error);
    throw error;
  }
};
const withdrawFundsService = async (userId, amount, toDeduct) => {
  try {
    // Find the wallet of the user
    let wallet = await walletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    // Update wallet balance
    if (toDeduct) {
      if (wallet.winningBalance < amount)
        throw new Error("Insufficient balance");
      wallet.balance -= amount;
      wallet.winningBalance -= amount;
      await wallet.save();
    }
    const walletTransactionData = {
      amount: amount,
      type: "debit", // Type is 'credit' for adding funds
      date: new Date(),
      description: `₹${amount} is withdrawn from wallet`,
      tournamentId: null,
    };
    console.log(walletTransactionData, "sf");
    // Add the transaction details to the wallet transactions
    const updatedWallet = await walletTransactionModel.findOneAndUpdate(
      { userId },
      { $push: { walletdata: walletTransactionData } },
      { new: true }
    );
    console.log(updatedWallet, "sf");
    return {
      status: "success",
      message: "Funds withdrawn from wallet successfully",
    };
  } catch (error) {
    console.error("Error in withdrawFundsService:", error);
    throw error;
  }
};
const reverseFundsService = async (userId, amount) => {
  try {
    // Find the wallet of the user
    let wallet = await walletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    // Update wallet balance
    wallet.balance += amount;
    wallet.winningBalance += amount;
    await wallet.save();
  } catch (error) {
    console.error("Error in reverseFundsService:", error);
    throw error;
  }
};
module.exports = {
  deductFundService,
  addFundsService,
  bonusFundService,
  winningsFundService,
  refundService,
  reverseFundsService,
  withdrawFundsService,
};

// const deductFundService = async (userId, amount, description) => {
//   try {
//     const wallet = await walletModel.findOne({ userId: userId });

//     if (!wallet) {
//       throw new Error('Wallet not found');
//     }

//     if (wallet.balance < amount) {
//       throw new Error('Insufficient balance');
//     }
//     let remainingAmount = amount;

//     if (wallet.depositBalance >= remainingAmount) {
//       wallet.depositBalance -= remainingAmount;
//     } else {
//       remainingAmount -= wallet.depositBalance;
//       wallet.depositBalance = 0;

//       if (wallet.bonusBalance >= remainingAmount) {
//         wallet.bonusBalance -= remainingAmount;
//       } else {
//         remainingAmount -= wallet.bonusBalance;
//         wallet.bonusBalance = 0;
//         wallet.winningBalance -= remainingAmount;
//       }
//     }

//     wallet.balance = wallet.depositBalance + wallet.bonusBalance || 0 + wallet.winningBalance;
//     await wallet.save();
//     const walletTransactionData = {
//       amount: amount,
//       type: 'debit', // Type is 'credit' for adding funds
//       date: new Date(),
//       description: description,
//       tournamentId: null,
//     };

//     // Add the transaction details to the wallet transactions
//     await walletTransactionModel.findOneAndUpdate(
//       { userId },
//       { $push: { walletdata: walletTransactionData } },
//       { new: true }
//     );

//     return { status: 'success', message: 'Funds deducted added to wallet successfully' };

//   }
//   catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

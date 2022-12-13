<button id="wallet_btn" style="margin: 20px;">Connect MetaMask</button>
<div>
    <input type="text" id="send_ammount" placeholder="보낼 금액을 입력해주세요." style="border: 1px solid; margin-left: 20px; display: none;">
    <button id="send_btn" onclick="confirmBalance()" style="margin: 20px; display: none;">Send MetaMask</button>
</div>
<script src="https://cdn.jsdelivr.net/gh/ethereum/web3.js/dist/web3.min.js"></script>
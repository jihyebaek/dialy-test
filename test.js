/**
 * 1. Connect MetaMask 버튼 클릭 시 MetaMask 계정과 연동 로직 추가( MetaMask Docs 참고 )
 *   - Connect MetaMask 버튼 클릭 시 loadWeb3 실행
 * 
 *   - MetaMask 와 연동 후
 *     - Connect MetaMask 버튼 text 를 연동된 지갑주소로 변경
 * 
 *     - 현재 연동된 MetaMask Chain IDs 를 구하고 변수에 추가 + 네트워크에 따른 url 구해서 변수에 추가
 *       - Main Network : https://etherscan.io/tx/
 *       - Ropsten Test Network : https://ropsten.etherscan.io/tx/
 *       - Rinkeby Test Network : https://rinkeby.etherscan.io/tx/
 *       - Goerli Test Network : https://goerli.etherscan.io/tx/
 *       - Kovan Test Network : https://kovan.etherscan.io/tx/
 * 
 *     - jQeury 를 이용하여 input type text 와 Send MetaMask 버튼 노출
 */

// MetaMask 연동 및 버튼 텍스트 지갑주소로 변경
document.getElementById('wallet_btn').addEventListener('click', event => {
  let account;
  let button = event.target;
  
  ethereum.request({method: 'eth_requestAccounts'}).then(accounts => {
    account = accounts[0];
    console.log(account);
    button.textContent = account;

    ethereum.request({method: 'eth_getBalance' , params: [account, 'latest']}).then(result => {
      console.log(result);
      let wei = parseInt(result,16);
      let balance = wei / (10**18);
      console.log(balance + " ETH");
    });
  });

  $("#send_ammount").show();
  $("#send_btn").show();

});



//현재 연동된 MetaMask Chain IDs 를 구하고 변수에 추가 + 네트워크에 따른 url 구해서 변수에 추가
const chainId = await ethereum.request({ method: 'eth_chainId' });
ethereum.on('chainChanged', handleChainChanged);

function handleChainChanged(_chainId) {
  // We recommend reloading the page, unless you must do otherwise
  window.location.reload();
}



async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.enable();
    }
}

/**
 * 2. 보낼 금액 입력( input type text 에 보낼 금액 입력 ) 후 Send MetaMask 버튼 클릭 시 Balance Check 로직 추가 ( Balance 란 해당 지갑주소에 보유하고 있는 ETH 금액 )
 *   - MetaMask 계정 지갑과 연도되어 있는지 체크
 * 
 *   - 보낼 금액을 0 이상 보내는지 체크
 * 
 *   - 보낼 금액을 0.001 로 고정
 * 
 *   - 현재 연동된 계정 지갑 Balance 가져오기
 * 
 *   - 가지고 온 MetaMask ETH Balance 와 input text 로 입력한 보낼 금액을 ajax 통신을 통해 금액 체크 
 * 
 *   - ETH Balance 가 input type text 로 입력한 금액보다 작을 경우 over balance alert 추가
 */

/**
 * Balance Check
 *   - ETH Balance 의 경우 0x1 데이터로 옴( 16진수 )
 * 
 *   - ETH Balance 금액 확인 방법
 *     - 앞에 0x 를 제외한 뒤의 값을 사용하여 16진수 -> 10진수로 변경 + 10의 -18 곱하기
 * 
 *   - ETH Balance 와 input type text 로 입력한 보낼 금액 비교
 * 
 *   - 위 내용 확인 후 Balance 금액이 더 크다면 보낼 금액( 10진수 데이터 )을 10진수 -> 16진수로 변경 + 10의 +18 곱하기 + 앞에 0x 붙여서 데이터 전달
 *     - ex: 전달되어야 하는 값 : '0x' + (16진수 * 10^18)
 */
//
if(window.ethereum.networkVersion == 10) {
  document.getElementById('send-button').addEventListener('click', event =>{
    let transactionParam = {
      to: '0x4Cd32925B6694330b02792119A63725E0Ba05054',
      from: account,
      value: '0x38D7EA4C68000'
    };
    
    ethereum.request({method: 'eth_sendTransaction', params:[transactionParam]}).then(txhash => {
      console.log(txhash);
      checkTransactionconfirmation(txhash).then(r => alert(r));
    });
  });
}


async function confirmBalance() {

}

/**
 * 3. Balance 체크를 마친 후 ETH 금액 전송
 *   - 전송 받을 지갑 주소는 본인 메타마스크 지갑주소
 * 
 *   - 전송 성공 후 받은 Hash 값을 alert 으로 출력
 * 
 *   - 데이터 저장하기 위해 hash 값, MetaMask Chain IDs 로 구한 네트워크에 따른 url, 전송한 지갑주소( from ), 전송 받을 지갑주소 ( to ), 보낸 금액을 Object 로 저장 후 ajax 통신으로 데이터 저장
 *     - DB 데이터 저장 완료 시 저장 완료 alert 추가
 */

/**
 * Data Insert
 *   - ajax 통신으로 받은 데이터들이 존재하는지 체크
 * 
 *   - 저장 테이블명 : metamask_history
 * 
 *   - 저장 변수
 *     - metamask_from : ETH 전송한 지갑주소
 *     - metamask_to : ETH 전송 받은 지갑주소
 *     - metamask_hash : ETH 전송 결과 Hash
 *     - metamask_url : ETH 전송한 url
 *     - metamask_price : ETH 전송한 금액
 * 
 *   - 정상적으로 DB 저장 완료 시 TRUE 로 반환, 실패 시 FALSE 로 반환
 * 
 *   - DB 저장 방법은 Codeigniter Docs 참고
 */
function checkTransactionconfirmation(txhash) {
  let checkTransactionLoop = () => {
    return ethereum.request({method:'eth_getTransactionReceipt',params:[txhash]}).then(r => {
      if(r !=null) return 'confirmed';
      else return checkTransactionLoop();
    });
  };

  return checkTransactionLoop();
}

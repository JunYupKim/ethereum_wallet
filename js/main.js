$(document).ready(function () {
    const web3 = new Web3(process.env.INFURA_ADDRESS);
    let Buffer = ethereumjs.Buffer.Buffer;

    $('#createAccount').on('click', async function () {
        let account = web3.eth.accounts.create();
        let balance = await web3.eth.getBalance(account.address);
        let transBalance =  web3.utils.fromWei(balance, "ether"); 

        // User's account info
        $('#fromaddress').val(account.address);
        $('#password').val(account.privateKey);
        $('#message').text("Your ETH balance: " + transBalance + " ETH   "   );

        let btn = document.createElement("button");
        btn.innerHTML = "Refresh Balance";
        btn.setAttribute("id","getBalance"); 
        document.getElementById("message").appendChild(btn);

        // make the createAccount disapear 
        document.getElementById('createAccount').style.display = "none";

        // QRCode 
        const qrcode = new QRCode(document.getElementById("qrcode"), {
            text: account.address,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    })

    $('#getBalance').on('click', async function() {
        console.log("HI"); 
        let fromAddress = $('#fromaddress').val();
        let balance = await web3.eth.getBalance(fromAddress);
        let transBalance =  web3.utils.fromWei(balance, "ether"); 
        $('#message').text("Your ETH balance: " + transBalance + " ETH   ");
    })

    // send 
    $('#submit').on('click', async function () {

        let privateKey = Buffer.from($('#password').val() , 'hex');
        let fromAddress = $('#fromaddress').val();
        let toAddress = $('#toaddress').val(); 
        let amount = $('#amount').val(); 
        let balance = await web3.eth.getBalance(fromAddress);
        let transBalance =  web3.utils.fromWei(balance, "ether"); 

        if(amount > transBalance){
            alert("Your Balance is not enough to send Transaction!!!"); 
        }

        web3.eth.getTransactionCount(fromAddress, (err, txCount) => {
            // Build the transaction
            const txObject = {
                nonce: web3.utils.toHex(txCount),
                to: toAddress,
                value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
                gasLimit: web3.utils.toHex(21000),
                gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
            }

            // Sign the transaction
            const tx = new ethereumjs.Tx(txObject);
            tx.sign(privateKey);

            const serializedTx = tx.serialize()
            const raw = '0x' + serializedTx.toString('hex')

            // Broadcast the transaction
            web3.eth.sendSignedTransaction(raw, (err, txHash) => {
                console.log('txHash:', txHash)
            })
        })  
    });

})
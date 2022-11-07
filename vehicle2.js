const { bin2hex, decToBin, fromHexString } = require("./conversion")
const crypto = require("crypto")
const secp256k1 = require('secp256k1')
const { ethers } = require("ethers");
const keccak256 = require('js-sha3').keccak256;
const EC = require('elliptic').ec;
var ec = new EC('secp256k1');

const express = require("express")
const app = express()
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});




//For vehicle
let privKeyHex = "3c41dd25b3ac2a2aea18aa2528b73e55072058bb0e37ed6d6d73d2cbf105d929"

//Private key in byte
const privKey = fromHexString(privKeyHex)


// get the public key in a compressed format
const pubKey = secp256k1.publicKeyCreate(privKey);

//Converting public key to address
// Import public key
var key = ec.keyFromPublic(pubKey);

// Convert to uncompressed format
const publicKeyUncompressed = key.getPublic().encode('hex').slice(2);

// Now apply keccak
const address = keccak256(Buffer.from(publicKeyUncompressed, 'hex')).slice(64 - 40);

console.log('Address', address)



//Request from vehicle about a particular event
//And RSU will also send this and a nearby vehicle also
app.use("/incomingRequest", (req, res) => {


    const msg = req.body.msg;
    const signObj = req.body.sigObj;
    const pubKey = req.body.sigObj;
    //Verify signature
    const msgAuthenticity = secp256k1.ecdsaVerify(signObj.signature, msg, pubKey)

    if (msgAuthenticity) {

        //Read the msg and notice the event and send that event to vehicle
        res.json({
            data: "Traffic block"
        })


    }

})

app.use("/sendMessage",async (req,res) => {

    const msg = req.body.msg;
    const signObj = req.body.msg;
    const pubKey = req.body.pubKey;
    const address ="";
    //Check authenticity of the message
    const msgAuthenticity = secp256k1.ecdsaVerify(signObj.signature, msg, pubKey)

    if(msgAuthenticity){

        const locOfcurretnVeh="";
        
        //Verify the vehicle and get the location of trust value
        const res = await fetch("localhost:3000/verifyVehicle",{
            body:JSON.stringify({pubKey})
        })

        //Compare the location and decide whether to accept the msg based on trust value

        //If information is correct update the trust value
        res.status(200).send("success")

    }

    res.status(200).send("success")


})

app.listen(5001);


function input() {
    rl.question("Enter 1 to Send Message to Nearby vehicle About an event\nEnter 2 to send a request to vehicle\n ", async function (res) {
        if (res === "1") {
            //Send message to nearby vehicle about any event that happened
            //Send the event,pubkey,and signed Message
            const resp = await (await fetch("localhost:5001/sendMessage").json())
        } else {
            rl.question("Press 1 if Want information from nearby location\nPress 2 if want information from far location", async (res) => {
                if (res == "1") {

                    //Send request to nearby Vehicle
                    rl.question("What information you want", async (info) => {

                        const resp = await (await fetch("localhost:5001/incomginRequest").json())

                        //After getting info check if the message is valid using signature
                        //If yes get the trust value of that vehicle
                        //And accept message according to trust value
                        //And update the trust value

                    })

                }
                else {
                    //Send request to RSU
                    rl.question("What information you want", async (info) => {

                        const resp = await (await fetch("localhost:3001/infoReq").json())
                        //RSU will respond with the event and the pubkey of the sender
                        //Check the trust value and update

                    })
                }


            })


        }
    });
}

input()






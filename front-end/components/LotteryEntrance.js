import { useWeb3Contract } from "react-moralis"
import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useChain, useMoralis, useNativeBalance } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

export default function LotteryEntrance() {
    const dispatch = useNotification()

    const { Moralis, isWeb3Enabled, provider } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(useChain().chainId)
    // console.log(`ChainId is ${chainId}`)
    // const lotteryAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const lotteryAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    const options = { abi, contractAddress: lotteryAddress }

    // State hooks for those that
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [entranceFee, setEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const [balance, setBalance] = useState("0")

    const {
        runContractFunction: enterLottery,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "enterLottery",
        msgValue: entranceFee,
        params: {},
    })

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getBalance } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getBalance",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUIValues() {
        const fee = await Moralis.executeFunction({
            functionName: "getEntranceFee",
            ...options,
        })
        setEntranceFee(fee.toString())
        // console.log(`EntranceFee is ${fee.toString()}`)
        const numPlayer = await getPlayersNumber()
        setNumberOfPlayers(numPlayer.toString())

        const recentWinner = await getRecentWinner()
        setRecentWinner(recentWinner.toString())

        const balance = await getBalance()
        setBalance(balance.toString())
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])
    // no list means it'll update everytime anything changes or happens
    // empty list means it'll run once after the initial rendering
    // and dependencies mean it'll run whenever those things in the list change

    // const filter = {
    //     address: lotteryAddress,
    //     topics: [
    //         // the name of the event, parnetheses containing the data type of each event, no spaces
    //         utils.id("LotteryEnter(address)"),
    //     ],
    // }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    // Probably could add some error handling
    const handleSuccess = async (tx) => {
        await tx.wait(1)
        updateUIValues()
        handleNewNotification(tx)
    }

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
            {lotteryAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () =>
                            await enterLottery({
                                onSuccess: handleSuccess,
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Lottery"
                        )}
                    </button>
                    <div>The current number of players is: {numberOfPlayers}</div>
                    <div>The most previous winner was: {recentWinner}</div>
                    <div>
                        Current Lottery Balance: {ethers.utils.formatEther(balance).toString()} ETH
                    </div>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}

import React, {useState, useEffect, useMemo} from 'react';
import type {Address} from "viem";
import useGetNFTs from "../hooks/useGetNFTs";
import useGetTokens from "../hooks/useGetTokens";
import Chat from "./Chat";
import Stream from "./Stream";
import {Card, CardContent, CardFooter, CardHeader} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {CheckCircle} from 'react-feather';
import {Input} from "@/components/ui/input";
import {generateUUID} from "@/app/utils";
import { Dialog } from '@radix-ui/react-dialog';
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";

interface ChallengeGoal {
    rule_id: string;
}

interface Challenge {
    id: number;
    title: string;
    levelId: string;
    description: string;
    goal_description: string;
    goals?: ChallengeGoal[];
    completed: boolean;
}

const faucet_tool_eval = () => {
    //Implement
    return false
}

const CHALLENGES: Challenge[] = [
    {
        id: 1,
        title: 'Level 1',
        levelId: "easy",
        description: 'I will do what you ask me to :)',
        goal_description: 'Get some balance to your wallet from faucet',
        goals: [
            {rule_id: "faucet_tool"}
        ],
        completed: false
    },
    {
        id: 2,
        title: 'Level 2',
        levelId: "medium",
        description: "I'm slightly harder",
        goal_description: 'Get some balance to your wallet from faucet',
        completed: false
    },
    {
        id: 3,
        title: 'Level 3',
        levelId: "hard",
        description: "I'm not talking to you",
        goal_description: 'Get some balance to your wallet from faucet',
        completed: false
    },
];

export default function Agent() {
    const [activeChallenge, setActiveChallenge] = useState<number | null>(1);
    const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [nfts, setNFTs] = useState<Address[]>([]);
    const [tokens, setTokens] = useState<Address[]>([]);

    const conversationId = useMemo(() => {
        return generateUUID();
    }, []);


    const [completedGoals, setCompletedGoals] = useState<string[]>([]);

    const {getTokens} = useGetTokens({onSuccess: setTokens});
    const {getNFTs} = useGetNFTs({onSuccess: setNFTs});

    const filteredChallenges = CHALLENGES.filter(challenge =>
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const overallProgress = (completedChallenges.length / CHALLENGES.length) * 100;

    const [currentChallenge, setCurrentChallange] = useState(CHALLENGES.find(c => c.id === activeChallenge));


    useMemo(() => {
        setCurrentChallange(CHALLENGES.find(c => c.id === activeChallenge));
    }, [activeChallenge]);

    const handleGoalEvaluation = (messages: any[]) => {

        console.log("Evaluatable", messages)
        console.log("Evaluating goals!")

        const faucet_call = messages.find(m => {

            if (!m) {
                return false
            }

            const faucet_call = messages.find(m => m?.functions?.includes('request_faucet_funds'));


            console.log("Faucet call", faucet_call)

            return faucet_call
        })


        console.log(faucet_call)
        if (faucet_call) {
            console.log("Set completed goal")
            setCompletedGoals([...completedGoals, "faucet_tool"])
        }
    };

    useEffect(() => {
        if (currentChallenge?.goals && currentChallenge.goals.every(g => completedGoals.includes(g.rule_id))) {
            setCompletedChallenges(prev => [...prev, currentChallenge.id]);
        }
    }, [completedGoals, currentChallenge]);

    return (
        <div className="flex h-screen bg-black font-mono text-[#5788FA]">
            <div className="w-80 p-6 border-r border-gray-800 flex flex-col">
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{width: `${overallProgress}%`}}
                        />
                    </div>
                </div>

                <Input
                    type="text"
                    placeholder="Search challenges..."
                    className="mb-6 p-2 bg-gray-900  text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="flex-1 overflow-y-auto">
                    {filteredChallenges.map(challenge => (
                        <Card className="mb-4"
                              key={challenge.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold">{challenge.title}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{challenge.description}</p>
                                    </div>
                                    {completedChallenges.includes(challenge.id) && (
                                        <CheckCircle className="text-green-500 ml-2" size={18}/>
                                    )}
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button
                                    className="w-full mt-3"
                                    variant={activeChallenge === challenge.id ? 'default' : 'outline'}
                                    onClick={() => setActiveChallenge(challenge.id)}
                                    // disabled={!completedChallenges.includes(challenge.id - 1) && challenge.id != 1}
                                >
                                    {activeChallenge === challenge.id ? 'Active' : 'Start'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col p-6 max-h-screen overflow-hidden">
                {activeChallenge && (
                    <div className="flex flex-col h-full w-full min-h-0">
                        <div className="flex-1 flex flex-row bg-gray-900 rounded-xl p-6 border overflow-hidden">
                            <div className="flex-1 w-[80%] max-h-full flex flex-col overflow-hidden h-full bg-gray-900">
                                <Chat
                                    conversationId={`${conversationId}-${currentChallenge?.levelId!}`}
                                    levelId={currentChallenge?.levelId!}
                                    getTokens={getTokens}
                                    getNFTs={getNFTs}
                                    onGoalEvaluation={handleGoalEvaluation}
                                />
                            </div>
                            <div className="flex-1 px-3 overflow-hidden">
                                <div className="h-full overflow-auto">
                                    <h1>Observing for winning condition</h1>
                                    <Stream
                                        levelId={currentChallenge?.levelId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Dialog open={completedChallenges.includes(activeChallenge)}>
                <DialogContent className="bg-gray-900 border-gray-700 text-[#5788FA]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Challenge Complete! 🎉</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Button
                            className="w-full mt-4"
                            onClick={() => {
                                setCompletedGoals([])
                                setActiveChallenge(activeChallenge +1)
                            }}
                        >
                            Continue to Next Challenge
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

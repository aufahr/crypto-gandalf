import { cn } from '@coinbase/onchainkit/theme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useChat from '../hooks/useChat';
import type { AgentMessage, StreamEntry } from '../types';
import { generateUUID, markdownToPlainText } from '../utils';
import ChatInput from './ChatInput';
import StreamItem from './StreamItem';

type ChatProps = {
  className?: string;
  levelId: string;
  getNFTs: () => void;
  getTokens: () => void;
  conversationId : string
  onGoalEvaluation : (messages : AgentMessage[]) => void
};

export default function Chat({ className, getNFTs, getTokens, levelId, onGoalEvaluation, conversationId }: ChatProps) {
  const [userInput, setUserInput] = useState('');
  const [streamEntries, setStreamEntries] = useState<StreamEntry[]>([]);

  const [shouldRefetchNFTs, setShouldRefetchNFTs] = useState(false);
  const [shouldRefetchTokens, setShouldRefetchTokens] = useState(false);

  useMemo(() => {
    setUserInput('')
    setStreamEntries([])
  }, [conversationId]);

  useEffect(() => {
    if (shouldRefetchNFTs) {
      getNFTs();
      setShouldRefetchNFTs(false);
    }
  }, [getNFTs, shouldRefetchNFTs]);

  useEffect(() => {
    if (shouldRefetchTokens) {
      getTokens();
      setShouldRefetchTokens(false);
    }
  }, [getTokens, shouldRefetchTokens]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [streamEntries]);

  const handleSuccess = useCallback((messages: AgentMessage[]) => {
    const functions =
      messages?.find((msg) => msg.event === 'tools')?.functions || [];

      if (functions?.includes('deploy_nft')) {
      setShouldRefetchNFTs(true);
    }

    if (functions?.includes('deploy_token')) {
      setShouldRefetchTokens(true);
    }

    onGoalEvaluation(messages)

    let message = messages.find((res) => res.event === 'agent');
    if (!message) {
      message = messages.find((res) => res.event === 'tools');
    }
    if (!message) {
      message = messages.find((res) => res.event === 'error');
    }
    const streamEntry: StreamEntry = {
      timestamp: new Date(),
      content: markdownToPlainText(message?.data || ''),
      type: 'agent',
    };
    setStreamEntries((prev) => [...prev, streamEntry]);
  }, []);

  const { postChat, isLoading } = useChat({
    levelId : levelId,
    onSuccess: handleSuccess,
    conversationId,
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userInput.trim()) {
        return;
      }

      setUserInput('');

      const userMessage: StreamEntry = {
        timestamp: new Date(),
        type: 'user',
        content: userInput.trim(),
      };

      setStreamEntries((prev) => [...prev, userMessage]);

      postChat(userInput);
    },
    [postChat, userInput],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-900 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {streamEntries.map((entry, index) => (
          <StreamItem
            key={`${entry.timestamp.toDateString()}-${index}`}
            entry={entry}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        userInput={userInput}
        handleKeyPress={handleKeyPress}
        handleSubmit={handleSubmit}
        setUserInput={setUserInput}
        disabled={isLoading}
      />
    </div>
  );
}

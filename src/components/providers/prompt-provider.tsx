'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { usePromptStore } from '@/store/prompt-store';
import { subscribeToPrompts } from '@/lib/firebase/firestore';

export function PromptSubscriptionManager() {
    const { user } = useAuthStore();
    const { setPrompts, setLoading, setError } = usePromptStore();

    useEffect(() => {
        if (!user?.uid) {
            setPrompts([]);
            return;
        }

        setLoading(true);
        setError(null);

        // Creates a single subscription for the entire app session
        console.log('[PromptSubscriptionManager] Starting subscription for user:', user.uid);

        const unsubscribe = subscribeToPrompts(
            user.uid,
            (newPrompts) => {
                setPrompts(newPrompts);
            },
            (err) => {
                console.error('[PromptSubscriptionManager] Subscription error:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            console.log('[PromptSubscriptionManager] Cleanup subscription');
            unsubscribe();
        };
    }, [user?.uid, setPrompts, setLoading, setError]);

    return null;
}

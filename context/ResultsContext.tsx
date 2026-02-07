import React, { createContext, useCallback, useContext, useState } from 'react';
import { ResultsData, ResultsService } from '../services/results';

type ResultsContextType = {
    showResults: () => void;
    hideResults: () => void;
    isVisible: boolean;
    results: ResultsData | null;
    loading: boolean;
    error: string | null;
    setResultsData: (data: ResultsData | null) => void;
    setLoadingState: (loading: boolean) => void;
    setErrorState: (error: string | null) => void;
    initFetch: () => void;
    fetchSignal: number;
};

const ResultsContext = createContext<ResultsContextType>({
    showResults: () => { },
    hideResults: () => { },
    isVisible: false,
    results: null,
    loading: false,
    error: null,
    setResultsData: () => { },
    setLoadingState: () => { },
    setErrorState: () => { },
    initFetch: () => { },
    fetchSignal: 0,
});

export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [results, setResults] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // New: trigger signal for ResultsOverlay to start fetching
    const [fetchSignal, setFetchSignal] = useState(0);

    // Helpers to allow consumers to update state
    const setResultsData = useCallback((data: ResultsData | null) => setResults(data), []);
    const setLoadingState = useCallback((l: boolean) => setLoading(l), []);
    const setErrorState = useCallback((e: string | null) => setError(e), []);

    // Load cache helper
    const loadCache = useCallback(async () => {
        if (!results) {
            const cached = await ResultsService.getCachedResults();
            if (cached) setResults(cached);
        }
    }, [results]);

    const showResults = () => {
        setIsVisible(true);
        loadCache();
    };

    const hideResults = () => setIsVisible(false);

    const initFetch = useCallback(() => {
        setLoading(true);
        setFetchSignal(prev => prev + 1);
    }, []);

    return (
        <ResultsContext.Provider value={{
            showResults,
            hideResults,
            isVisible,
            results,
            loading,
            error,
            setResultsData,
            setLoadingState,
            setErrorState,
            initFetch,
            fetchSignal
        }}>
            {children}
        </ResultsContext.Provider>
    );
};

export const useResults = () => useContext(ResultsContext);

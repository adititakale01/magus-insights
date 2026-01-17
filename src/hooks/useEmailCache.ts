import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAllEmails, EmailRecord } from '@/lib/api';

export function useEmailCache() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['all-emails'],
        queryFn: fetchAllEmails,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // 5 minutes
    });

    const refresh = () => {
        return queryClient.invalidateQueries({ queryKey: ['all-emails'] });
    };

    return {
        ...query,
        refresh,
        lastUpdated: query.dataUpdatedAt
    };
}

export type PageProp = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export type DisplaySelectorProps = {
    display: 'grid' | 'list';
    setDisplay: (display: 'grid' | 'list') => void;
    handleLimitChange: (value: string) => void;
    handleSortChange: (value: string) => void;
    limit: string;
    sort: string;
    totalProducts: number;
    showingFrom: number;
    showingTo: number;
};

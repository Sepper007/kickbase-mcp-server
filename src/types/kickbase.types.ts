export interface PlayerMarketItem {
    fn: string;
    n: string;
    mv: number;
    i: string;
    exs: number;
}

export interface PlayerData {
    fn: string;
    ln: string;
    tn: string;
    mv: number;
    tp: number;
    ap: number;
    ph: Array<{ p: number }>;
}

export interface MarketValueEntry {
    mv: number;
}

export interface MarketValueData {
    it: MarketValueEntry[];
}

export interface MarketValueTrends {
    oneDayTrend: number;
    sevenDayTrend: number;
}
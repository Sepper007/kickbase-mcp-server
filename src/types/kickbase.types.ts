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

export interface SquadPlayer {
    ap: number;      // average points
    i: string;       // player id
    iotm: boolean;   // in form
    lo: number;      // lineup order
    lst: number;     // last status
    mdst: number;    // match day status
    mv: number;      // market value
    mvgl: number;    // market value gain/loss
    mvt: number;     // market value trend
    n: string;       // name
    ofc: number;     // offer count
    p: number;       // points
    pos: number;     // position (1=GK, 2=DEF, 3=MID, 4=ATT)
    sdmvt: number;   // season market value trend
    st: number;      // status
    tfhmvt: number;  // trend from highest market value
    tid: string;     // team id
}

export interface SquadData {
    it: SquadPlayer[];
    mppu: number;    // max players per team
}
export interface InfractionData {
    //action: InfractionAction;
    guild: string;
    user: string;
    end: number;
}

export interface Infraction {
    //action: InfractionAction;
    guild: string;
    user: string;
    moderator: string;
    reason: string;
    date: number;
    complete: boolean;
    end?: number;
}

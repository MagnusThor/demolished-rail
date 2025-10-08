
export interface ITileBlueprint {

    id: number;
    name?: string;
    color?: string;
    width: number;
    height: number;
    texture?: string;
    offset?: {
        x: number;
        y: number;
    };
    zIndex: number;


}

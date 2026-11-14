export function gline(g:CanvasRenderingContext2D,pts:number[][]|Path2D,opts?:{w?:number;part?:number;closed?:boolean;glow?:number;double?:number;sheen?:number;alpha?:number;color?:string|null;bb?:number[]}):void;
export function goldGrad(g:CanvasRenderingContext2D,x0:number,y0:number,x1:number,y1:number,opts?:{sheen?:number;hot?:number;tint?:string}):CanvasGradient;
export function airbrush(g:CanvasRenderingContext2D,pts:number[][]|Path2D,opts?:Record<string,unknown>):Path2D;

import type { Caption } from "@remotion/captions";
export type Scene = {
  id: string;
  kind: string;
  title: string;
  chapter: string;
  start: number;
  duration: number;
  text: string;
  cues: Record<string, number>;
};
export type Model = {
  stones: [number, number, boolean][];
  hero: [number, number, boolean][];
  candidates: [number, number][];
};
export type FilmData = {
  duration: number;
  title: string;
  labels: Record<string, string>;
  scenes: Scene[];
  captions: FilmCaption[];
};
export type FilmCaption = Caption & { scene: string };

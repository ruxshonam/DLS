export type PlayerPosition = 
  | 'GK' 
  | 'CB' | 'LB' | 'RB' 
  | 'CDM' | 'CM' | 'CAM' 
  | 'LM' | 'RM' 
  | 'LW' | 'RW' | 'ST';

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface PlayerData {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  rating: number;
  attributes: PlayerAttributes;
  stamina: number;
  skinTone?: string;
  hairColor?: string;
  hairStyle?: 'short' | 'spiky' | 'curly' | 'fade';
  height?: number;
  yellowCards?: number;
  isRedCarded?: boolean;
}

export type KitPattern = 'solid' | 'stripes' | 'hoops' | 'sash';

export type FormationType = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1';

export interface TeamData {
  id: string;
  name: string;
  shortName: string;
  country: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gkColor: string;
  kitPattern: KitPattern;
  stadiumName: string;
  formation: FormationType;
  players: PlayerData[];
}

export type GameMode = 'quick' | 'tournament' | 'penalty' | 'training' | 'friend';

export type MatchPlayMode = '1player' | '2players_local' | 'online_friend';

export type CameraMode = 'tele' | 'dynamic' | 'topdown' | 'endtoend';

export type AIDifficulty = 'beginner' | 'amateur' | 'legend';

export interface GameSettings {
  soundEnabled: boolean;
  commentaryEnabled: boolean;
  commentaryLanguage: 'uz' | 'en';
  crowdVolume: number;
  sfxVolume: number;
  matchDurationMinutes: number; // 3, 5, 8
  difficulty: AIDifficulty;
  cameraMode: CameraMode;
  showRadar: boolean;
  autoSwitch: boolean;
  matchPlayMode: MatchPlayMode;
}

export interface FoulEvent {
  player: PlayerData;
  teamId: string;
  cardType: 'none' | 'yellow' | 'red';
  isPenalty: boolean;
}

export interface OutEvent {
  type: 'throw_in' | 'corner' | 'goal_kick';
  awardedTeamId: string;
  x: number;
  z: number;
}

export interface MatchStats {
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePasses: number;
  awayPasses: number;
  homePossessionTime: number;
  awayPossessionTime: number;
  homeCorners: number;
  awayCorners: number;
  homeTackles: number;
  awayTackles: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
  goals: {
    scorerName: string;
    teamId: string;
    minute: number;
    shotSpeedKmh: number;
  }[];
}

export interface TournamentMatch {
  id: string;
  round: 'quarter' | 'semi' | 'final';
  homeTeam: TeamData;
  awayTeam: TeamData;
  homeScore?: number;
  awayScore?: number;
  winnerTeamId?: string;
  played: boolean;
}

export interface TournamentState {
  currentRound: 'quarter' | 'semi' | 'final' | 'champion';
  matches: TournamentMatch[];
  userTeamId: string;
}

export interface PenaltyKickerState {
  teamId: string;
  kicker: PlayerData;
  score: boolean | null;
}

export interface MarketPlayer {
  id: string;
  name: string;
  team: string;
  position: PlayerPosition;
  rating: number;
  price: number;
  attributes: PlayerAttributes;
  photoUrl?: string;
}

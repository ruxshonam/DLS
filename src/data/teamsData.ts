import { TeamData, PlayerData } from '../types/game';

export const INITIAL_TEAMS: TeamData[] = [
  {
    id: 'madrid_royals',
    name: 'Madrid Royals',
    shortName: 'MDR',
    country: 'Spain',
    primaryColor: '#FFFFFF',
    secondaryColor: '#1E293B',
    accentColor: '#F59E0B',
    gkColor: '#0EA5E9',
    kitPattern: 'solid',
    stadiumName: 'Estadio Real',
    formation: '4-3-3',
    players: [
      { id: 'mdr_1', name: 'Thibault Couron', number: 1, position: 'GK', rating: 90, attributes: { pace: 52, shooting: 24, passing: 78, dribbling: 45, defending: 92, physical: 88 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#2b1d0c', hairStyle: 'short', height: 1.05 },
      { id: 'mdr_2', name: 'Dani Carval', number: 2, position: 'RB', rating: 85, attributes: { pace: 82, shooting: 58, passing: 81, dribbling: 80, defending: 84, physical: 82 }, stamina: 100, skinTone: '#d9a97d', hairColor: '#1a1105', hairStyle: 'fade' },
      { id: 'mdr_3', name: 'Eder Milito', number: 3, position: 'CB', rating: 86, attributes: { pace: 84, shooting: 48, passing: 74, dribbling: 72, defending: 87, physical: 85 }, stamina: 100, skinTone: '#8d5524', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'mdr_4', name: 'Antonio Rudig', number: 22, position: 'CB', rating: 87, attributes: { pace: 86, shooting: 54, passing: 72, dribbling: 69, defending: 88, physical: 90 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'fade' },
      { id: 'mdr_5', name: 'Ferland Mendy', number: 23, position: 'LB', rating: 83, attributes: { pace: 88, shooting: 62, passing: 76, dribbling: 78, defending: 84, physical: 84 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'short' },
      { id: 'mdr_6', name: 'Federico Valver', number: 15, position: 'CM', rating: 88, attributes: { pace: 89, shooting: 84, passing: 85, dribbling: 83, defending: 80, physical: 86 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#714c27', hairStyle: 'short' },
      { id: 'mdr_7', name: 'Aurelien Tchouam', number: 18, position: 'CDM', rating: 85, attributes: { pace: 76, shooting: 72, passing: 82, dribbling: 79, defending: 85, physical: 87 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'mdr_8', name: 'Jude Belling', number: 5, position: 'CAM', rating: 91, attributes: { pace: 84, shooting: 86, passing: 87, dribbling: 88, defending: 78, physical: 84 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'fade' },
      { id: 'mdr_9', name: 'Rodrygo Silva', number: 11, position: 'RW', rating: 87, attributes: { pace: 91, shooting: 83, passing: 82, dribbling: 89, defending: 42, physical: 68 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'fade' },
      { id: 'mdr_10', name: 'Kylian Donat', number: 9, position: 'ST', rating: 93, attributes: { pace: 97, shooting: 92, passing: 82, dribbling: 93, defending: 36, physical: 79 }, stamina: 100, skinTone: '#7c4c23', hairColor: '#080808', hairStyle: 'fade' },
      { id: 'mdr_11', name: 'Vini Junior', number: 7, position: 'LW', rating: 92, attributes: { pace: 96, shooting: 87, passing: 83, dribbling: 94, defending: 32, physical: 70 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'fade' },
      // Bench
      { id: 'mdr_12', name: 'Luka Modric', number: 10, position: 'CM', rating: 86, attributes: { pace: 68, shooting: 78, passing: 90, dribbling: 87, defending: 72, physical: 65 }, stamina: 100, skinTone: '#f0d0b0', hairColor: '#c49a45', hairStyle: 'curly' },
      { id: 'mdr_13', name: 'Eduardo Camav', number: 6, position: 'CM', rating: 84, attributes: { pace: 82, shooting: 70, passing: 82, dribbling: 84, defending: 81, physical: 82 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'curly' },
      { id: 'mdr_14', name: 'Brahim Diaz', number: 21, position: 'CAM', rating: 82, attributes: { pace: 86, shooting: 76, passing: 79, dribbling: 86, defending: 38, physical: 62 }, stamina: 100, skinTone: '#d9a97d', hairColor: '#1a1105', hairStyle: 'short' },
      { id: 'mdr_15', name: 'David Alaba', number: 4, position: 'CB', rating: 84, attributes: { pace: 78, shooting: 72, passing: 84, dribbling: 79, defending: 84, physical: 76 }, stamina: 100, skinTone: '#8d5524', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'mdr_16', name: 'Andriy Lunin', number: 13, position: 'GK', rating: 81, attributes: { pace: 48, shooting: 20, passing: 70, dribbling: 40, defending: 83, physical: 78 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#8a6538', hairStyle: 'short' }
    ]
  },
  {
    id: 'manchester_titans',
    name: 'Manchester Titans',
    shortName: 'MCI',
    country: 'England',
    primaryColor: '#38BDF8', // Sky Blue
    secondaryColor: '#0F172A',
    accentColor: '#FFFFFF',
    gkColor: '#F59E0B',
    kitPattern: 'solid',
    stadiumName: 'Titan Arena',
    formation: '4-3-3',
    players: [
      { id: 'mci_1', name: 'Ederson Mora', number: 31, position: 'GK', rating: 89, attributes: { pace: 62, shooting: 28, passing: 89, dribbling: 55, defending: 89, physical: 82 }, stamina: 100, skinTone: '#c79468', hairColor: '#111', hairStyle: 'short' },
      { id: 'mci_2', name: 'Kyle Walk', number: 2, position: 'RB', rating: 84, attributes: { pace: 92, shooting: 60, passing: 75, dribbling: 77, defending: 82, physical: 84 }, stamina: 100, skinTone: '#8d5524', hairColor: '#050505', hairStyle: 'fade' },
      { id: 'mci_3', name: 'Ruben Diasso', number: 3, position: 'CB', rating: 88, attributes: { pace: 74, shooting: 40, passing: 76, dribbling: 71, defending: 90, physical: 87 }, stamina: 100, skinTone: '#e0b892', hairColor: '#241a10', hairStyle: 'short' },
      { id: 'mci_4', name: 'Manuel Akanj', number: 25, position: 'CB', rating: 85, attributes: { pace: 82, shooting: 45, passing: 78, dribbling: 75, defending: 85, physical: 84 }, stamina: 100, skinTone: '#7c4c23', hairColor: '#080808', hairStyle: 'short' },
      { id: 'mci_5', name: 'Josko Gvard', number: 24, position: 'LB', rating: 86, attributes: { pace: 83, shooting: 64, passing: 79, dribbling: 81, defending: 86, physical: 85 }, stamina: 100, skinTone: '#e0b892', hairColor: '#1c150e', hairStyle: 'short' },
      { id: 'mci_6', name: 'Rodri Hernan', number: 16, position: 'CDM', rating: 92, attributes: { pace: 68, shooting: 84, passing: 90, dribbling: 85, defending: 89, physical: 88 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#302213', hairStyle: 'short' },
      { id: 'mci_7', name: 'Kevin De Bruy', number: 17, position: 'CAM', rating: 91, attributes: { pace: 74, shooting: 88, passing: 95, dribbling: 87, defending: 65, physical: 76 }, stamina: 100, skinTone: '#ffdfd0', hairColor: '#c83820', hairStyle: 'short' },
      { id: 'mci_8', name: 'Bernardo Silv', number: 20, position: 'CM', rating: 88, attributes: { pace: 78, shooting: 79, passing: 88, dribbling: 92, defending: 68, physical: 70 }, stamina: 100, skinTone: '#e0b892', hairColor: '#2b1d0c', hairStyle: 'short' },
      { id: 'mci_9', name: 'Phil Foden', number: 47, position: 'RW', rating: 89, attributes: { pace: 87, shooting: 86, passing: 86, dribbling: 90, defending: 55, physical: 68 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#90704c', hairStyle: 'fade' },
      { id: 'mci_10', name: 'Erling Haal', number: 9, position: 'ST', rating: 93, attributes: { pace: 91, shooting: 94, passing: 68, dribbling: 81, defending: 45, physical: 92 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#e0c068', hairStyle: 'short', height: 1.08 },
      { id: 'mci_11', name: 'Jeremy Doku', number: 11, position: 'LW', rating: 84, attributes: { pace: 95, shooting: 73, passing: 77, dribbling: 91, defending: 35, physical: 72 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'curly' },
      // Bench
      { id: 'mci_12', name: 'Mateo Kovac', number: 8, position: 'CM', rating: 83, attributes: { pace: 76, shooting: 69, passing: 84, dribbling: 86, defending: 76, physical: 76 }, stamina: 100, skinTone: '#e0b892', hairColor: '#1c150e', hairStyle: 'short' },
      { id: 'mci_13', name: 'Jack Greal', number: 10, position: 'LW', rating: 84, attributes: { pace: 78, shooting: 76, passing: 84, dribbling: 88, defending: 52, physical: 72 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#4a301a', hairStyle: 'curly' },
      { id: 'mci_14', name: 'John Stone', number: 5, position: 'CB', rating: 85, attributes: { pace: 75, shooting: 55, passing: 83, dribbling: 80, defending: 86, physical: 80 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'mci_15', name: 'Rico Lew', number: 82, position: 'RB', rating: 79, attributes: { pace: 80, shooting: 60, passing: 80, dribbling: 82, defending: 77, physical: 65 }, stamina: 100, skinTone: '#a06535', hairColor: '#0a0a0a', hairStyle: 'curly' },
      { id: 'mci_16', name: 'Stefan Orte', number: 18, position: 'GK', rating: 81, attributes: { pace: 50, shooting: 20, passing: 78, dribbling: 45, defending: 81, physical: 78 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#302213', hairStyle: 'short' }
    ]
  },
  {
    id: 'catalonia_fc',
    name: 'Catalonia FC',
    shortName: 'CAT',
    country: 'Spain',
    primaryColor: '#1D4ED8', // Blaugrana Blue
    secondaryColor: '#B91C1C', // Blaugrana Red
    accentColor: '#FBBF24',
    gkColor: '#10B981',
    kitPattern: 'stripes',
    stadiumName: 'Camp Monumental',
    formation: '4-3-3',
    players: [
      { id: 'cat_1', name: 'Marc Stegen', number: 1, position: 'GK', rating: 89, attributes: { pace: 55, shooting: 22, passing: 87, dribbling: 48, defending: 89, physical: 80 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#705030', hairStyle: 'short' },
      { id: 'cat_2', name: 'Jules Kounde', number: 23, position: 'RB', rating: 86, attributes: { pace: 84, shooting: 45, passing: 76, dribbling: 77, defending: 86, physical: 82 }, stamina: 100, skinTone: '#7c4c23', hairColor: '#080808', hairStyle: 'curly' },
      { id: 'cat_3', name: 'Ronald Arauj', number: 4, position: 'CB', rating: 87, attributes: { pace: 83, shooting: 42, passing: 68, dribbling: 66, defending: 89, physical: 89 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'short' },
      { id: 'cat_4', name: 'Pau Cubars', number: 2, position: 'CB', rating: 83, attributes: { pace: 72, shooting: 40, passing: 84, dribbling: 76, defending: 83, physical: 77 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'cat_5', name: 'Alejandro Bald', number: 3, position: 'LB', rating: 84, attributes: { pace: 94, shooting: 55, passing: 76, dribbling: 82, defending: 80, physical: 74 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'short' },
      { id: 'cat_6', name: 'Marc Casad', number: 17, position: 'CDM', rating: 82, attributes: { pace: 75, shooting: 62, passing: 82, dribbling: 80, defending: 82, physical: 78 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#302213', hairStyle: 'short' },
      { id: 'cat_7', name: 'Pedri Gonzal', number: 8, position: 'CM', rating: 88, attributes: { pace: 78, shooting: 74, passing: 91, dribbling: 90, defending: 72, physical: 71 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#302213', hairStyle: 'short' },
      { id: 'cat_8', name: 'Dani Olmo', number: 20, position: 'CAM', rating: 86, attributes: { pace: 80, shooting: 83, passing: 85, dribbling: 87, defending: 55, physical: 72 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#503518', hairStyle: 'short' },
      { id: 'cat_9', name: 'Lamine Yamal', number: 19, position: 'RW', rating: 88, attributes: { pace: 92, shooting: 84, passing: 86, dribbling: 93, defending: 40, physical: 67 }, stamina: 100, skinTone: '#8d5524', hairColor: '#0a0a0a', hairStyle: 'fade' },
      { id: 'cat_10', name: 'Robert Lewan', number: 9, position: 'ST', rating: 90, attributes: { pace: 76, shooting: 92, passing: 79, dribbling: 84, defending: 44, physical: 84 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#382512', hairStyle: 'short' },
      { id: 'cat_11', name: 'Raphinha Bell', number: 11, position: 'LW', rating: 88, attributes: { pace: 91, shooting: 85, passing: 84, dribbling: 87, defending: 62, physical: 76 }, stamina: 100, skinTone: '#a06535', hairColor: '#0a0a0a', hairStyle: 'fade' },
      // Bench
      { id: 'cat_12', name: 'Gavi Paez', number: 6, position: 'CM', rating: 85, attributes: { pace: 79, shooting: 72, passing: 83, dribbling: 84, defending: 78, physical: 81 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#2b1d0c', hairStyle: 'short' },
      { id: 'cat_13', name: 'Frenkie Jong', number: 21, position: 'CM', rating: 86, attributes: { pace: 81, shooting: 72, passing: 87, dribbling: 89, defending: 78, physical: 79 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#e0c068', hairStyle: 'short' },
      { id: 'cat_14', name: 'Ferran Torr', number: 7, position: 'ST', rating: 82, attributes: { pace: 83, shooting: 80, passing: 76, dribbling: 81, defending: 40, physical: 73 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#241a10', hairStyle: 'short' },
      { id: 'cat_15', name: 'Inigo Mart', number: 5, position: 'CB', rating: 82, attributes: { pace: 68, shooting: 44, passing: 76, dribbling: 66, defending: 83, physical: 80 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#302213', hairStyle: 'short' },
      { id: 'cat_16', name: 'Inaki Pena', number: 13, position: 'GK', rating: 78, attributes: { pace: 48, shooting: 18, passing: 70, dribbling: 35, defending: 78, physical: 74 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#4a301a', hairStyle: 'short' }
    ]
  },
  {
    id: 'paris_stars',
    name: 'Paris Stars',
    shortName: 'PAR',
    country: 'France',
    primaryColor: '#0F172A', // Navy
    secondaryColor: '#EF4444', // Red
    accentColor: '#FFFFFF',
    gkColor: '#EAB308',
    kitPattern: 'sash',
    stadiumName: 'Parc des Princes',
    formation: '4-3-3',
    players: [
      { id: 'par_1', name: 'Gigi Donnar', number: 1, position: 'GK', rating: 89, attributes: { pace: 50, shooting: 20, passing: 76, dribbling: 40, defending: 90, physical: 86 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#2b1d0c', hairStyle: 'short' },
      { id: 'par_2', name: 'Achraf Hakim', number: 2, position: 'RB', rating: 87, attributes: { pace: 94, shooting: 76, passing: 81, dribbling: 84, defending: 81, physical: 80 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'fade' },
      { id: 'par_3', name: 'Marquinhos C', number: 5, position: 'CB', rating: 87, attributes: { pace: 78, shooting: 54, passing: 76, dribbling: 72, defending: 89, physical: 81 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'short' },
      { id: 'par_4', name: 'Willian Pacho', number: 51, position: 'CB', rating: 83, attributes: { pace: 80, shooting: 40, passing: 70, dribbling: 66, defending: 84, physical: 85 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'short' },
      { id: 'par_5', name: 'Nuno Mendes', number: 25, position: 'LB', rating: 85, attributes: { pace: 93, shooting: 65, passing: 78, dribbling: 83, defending: 81, physical: 78 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'short' },
      { id: 'par_6', name: 'Vitinha Sant', number: 17, position: 'CM', rating: 86, attributes: { pace: 78, shooting: 76, passing: 88, dribbling: 87, defending: 76, physical: 72 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#2b1d0c', hairStyle: 'short' },
      { id: 'par_7', name: 'Warren Zaire', number: 33, position: 'CM', rating: 84, attributes: { pace: 82, shooting: 74, passing: 83, dribbling: 84, defending: 79, physical: 82 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'fade' },
      { id: 'par_8', name: 'Joao Neves', number: 87, position: 'CDM', rating: 85, attributes: { pace: 80, shooting: 70, passing: 85, dribbling: 84, defending: 82, physical: 80 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'par_9', name: 'Ousmane Demb', number: 10, position: 'RW', rating: 88, attributes: { pace: 93, shooting: 80, passing: 84, dribbling: 92, defending: 38, physical: 65 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'fade' },
      { id: 'par_10', name: 'Goncalo Ramos', number: 9, position: 'ST', rating: 83, attributes: { pace: 81, shooting: 84, passing: 72, dribbling: 79, defending: 44, physical: 80 }, stamina: 100, skinTone: '#e0b892', hairColor: '#241a10', hairStyle: 'short' },
      { id: 'par_11', name: 'Bradley Barcol', number: 29, position: 'LW', rating: 85, attributes: { pace: 92, shooting: 82, passing: 80, dribbling: 88, defending: 42, physical: 70 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'curly' },
      // Bench
      { id: 'par_12', name: 'Randal Kolo', number: 23, position: 'ST', rating: 82, attributes: { pace: 88, shooting: 80, passing: 74, dribbling: 82, defending: 42, physical: 78 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'par_13', name: 'Marco Asens', number: 11, position: 'CAM', rating: 82, attributes: { pace: 78, shooting: 82, passing: 81, dribbling: 83, defending: 44, physical: 66 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#241a10', hairStyle: 'short' },
      { id: 'par_14', name: 'Fabian Ruiz', number: 8, position: 'CM', rating: 83, attributes: { pace: 72, shooting: 78, passing: 84, dribbling: 82, defending: 76, physical: 76 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'par_15', name: 'Lucas Beraldo', number: 35, position: 'CB', rating: 79, attributes: { pace: 74, shooting: 38, passing: 77, dribbling: 73, defending: 80, physical: 76 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#1a1105', hairStyle: 'short' },
      { id: 'par_16', name: 'Matvey Safon', number: 39, position: 'GK', rating: 80, attributes: { pace: 46, shooting: 20, passing: 70, dribbling: 38, defending: 81, physical: 78 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#8a6538', hairStyle: 'short' }
    ]
  },
  {
    id: 'bavaria_fc',
    name: 'Bavaria FC',
    shortName: 'BAV',
    country: 'Germany',
    primaryColor: '#DC2626', // Red
    secondaryColor: '#FFFFFF',
    accentColor: '#1E3A8A',
    gkColor: '#047857',
    kitPattern: 'solid',
    stadiumName: 'Bavaria Park',
    formation: '4-2-3-1',
    players: [
      { id: 'bav_1', name: 'Manuel Neuman', number: 1, position: 'GK', rating: 89, attributes: { pace: 58, shooting: 30, passing: 91, dribbling: 55, defending: 90, physical: 84 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#90704c', hairStyle: 'short' },
      { id: 'bav_2', name: 'Joshua Kimm', number: 6, position: 'RB', rating: 88, attributes: { pace: 74, shooting: 76, passing: 92, dribbling: 84, defending: 83, physical: 78 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#8a6538', hairStyle: 'short' },
      { id: 'bav_3', name: 'Dayot Upamec', number: 2, position: 'CB', rating: 86, attributes: { pace: 85, shooting: 44, passing: 75, dribbling: 72, defending: 86, physical: 88 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'bav_4', name: 'Minjae Kim', number: 3, position: 'CB', rating: 85, attributes: { pace: 81, shooting: 38, passing: 72, dribbling: 68, defending: 87, physical: 86 }, stamina: 100, skinTone: '#ebd0b0', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'bav_5', name: 'Alphonso Dav', number: 19, position: 'LB', rating: 86, attributes: { pace: 96, shooting: 68, passing: 79, dribbling: 86, defending: 79, physical: 78 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'fade' },
      { id: 'bav_6', name: 'Aleks Pavlov', number: 45, position: 'CDM', rating: 83, attributes: { pace: 74, shooting: 68, passing: 84, dribbling: 81, defending: 80, physical: 78 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#2b1d0c', hairStyle: 'short' },
      { id: 'bav_7', name: 'Joao Palhin', number: 16, position: 'CDM', rating: 86, attributes: { pace: 72, shooting: 66, passing: 78, dribbling: 74, defending: 88, physical: 90 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#121212', hairStyle: 'short' },
      { id: 'bav_8', name: 'Michael Olise', number: 17, position: 'RW', rating: 86, attributes: { pace: 87, shooting: 82, passing: 85, dribbling: 89, defending: 48, physical: 73 }, stamina: 100, skinTone: '#7c4c23', hairColor: '#080808', hairStyle: 'curly' },
      { id: 'bav_9', name: 'Jamal Musial', number: 42, position: 'CAM', rating: 90, attributes: { pace: 89, shooting: 85, passing: 86, dribbling: 94, defending: 62, physical: 68 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'fade' },
      { id: 'bav_10', name: 'Serge Gnabry', number: 7, position: 'LW', rating: 85, attributes: { pace: 88, shooting: 84, passing: 80, dribbling: 85, defending: 44, physical: 74 }, stamina: 100, skinTone: '#7c4c23', hairColor: '#080808', hairStyle: 'curly' },
      { id: 'bav_11', name: 'Harry Keen', number: 9, position: 'ST', rating: 92, attributes: { pace: 74, shooting: 94, passing: 87, dribbling: 83, defending: 48, physical: 84 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#a07840', hairStyle: 'short' },
      // Bench
      { id: 'bav_12', name: 'Thomas Mulle', number: 25, position: 'CAM', rating: 84, attributes: { pace: 68, shooting: 82, passing: 84, dribbling: 79, defending: 62, physical: 72 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#6a4a2a', hairStyle: 'short' },
      { id: 'bav_13', name: 'Leroy Sane', number: 10, position: 'RW', rating: 85, attributes: { pace: 92, shooting: 83, passing: 80, dribbling: 88, defending: 38, physical: 70 }, stamina: 100, skinTone: '#8d5524', hairColor: '#0f0f0f', hairStyle: 'curly' },
      { id: 'bav_14', name: 'Konrad Laim', number: 27, position: 'CM', rating: 83, attributes: { pace: 83, shooting: 70, passing: 78, dribbling: 79, defending: 82, physical: 82 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#705030', hairStyle: 'short' },
      { id: 'bav_15', name: 'Eric Dier', number: 15, position: 'CB', rating: 80, attributes: { pace: 62, shooting: 50, passing: 76, dribbling: 66, defending: 81, physical: 82 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'bav_16', name: 'Sven Ulreic', number: 26, position: 'GK', rating: 77, attributes: { pace: 45, shooting: 18, passing: 68, dribbling: 34, defending: 78, physical: 76 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#8a6538', hairStyle: 'short' }
    ]
  },
  {
    id: 'london_gunners',
    name: 'London Gunners',
    shortName: 'LON',
    country: 'England',
    primaryColor: '#DC2626', // Red body
    secondaryColor: '#FFFFFF', // White sleeves
    accentColor: '#F59E0B',
    gkColor: '#0284C7',
    kitPattern: 'solid',
    stadiumName: 'Emirates Dome',
    formation: '4-3-3',
    players: [
      { id: 'lon_1', name: 'David Rayo', number: 22, position: 'GK', rating: 87, attributes: { pace: 56, shooting: 24, passing: 86, dribbling: 50, defending: 88, physical: 80 }, stamina: 100, skinTone: '#e0b892', hairColor: '#1c150e', hairStyle: 'short' },
      { id: 'lon_2', name: 'Ben Whito', number: 4, position: 'RB', rating: 84, attributes: { pace: 81, shooting: 54, passing: 79, dribbling: 78, defending: 85, physical: 79 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#90704c', hairStyle: 'short' },
      { id: 'lon_3', name: 'William Salib', number: 2, position: 'CB', rating: 88, attributes: { pace: 84, shooting: 42, passing: 78, dribbling: 74, defending: 89, physical: 86 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'short' },
      { id: 'lon_4', name: 'Gabriel Magal', number: 6, position: 'CB', rating: 87, attributes: { pace: 80, shooting: 50, passing: 72, dribbling: 68, defending: 88, physical: 88 }, stamina: 100, skinTone: '#7c4c23', hairColor: '#080808', hairStyle: 'short' },
      { id: 'lon_5', name: 'Jurrien Timb', number: 12, position: 'LB', rating: 84, attributes: { pace: 86, shooting: 52, passing: 79, dribbling: 82, defending: 84, physical: 80 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'fade' },
      { id: 'lon_6', name: 'Declan Ricer', number: 41, position: 'CDM', rating: 88, attributes: { pace: 78, shooting: 74, passing: 84, dribbling: 81, defending: 89, physical: 88 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'lon_7', name: 'Martin Odega', number: 8, position: 'CAM', rating: 89, attributes: { pace: 79, shooting: 84, passing: 91, dribbling: 90, defending: 64, physical: 68 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#d4aa55', hairStyle: 'short' },
      { id: 'lon_8', name: 'Mikel Merin', number: 23, position: 'CM', rating: 84, attributes: { pace: 74, shooting: 76, passing: 82, dribbling: 80, defending: 83, physical: 84 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#2b1d0c', hairStyle: 'short' },
      { id: 'lon_9', name: 'Bukayo Saka', number: 7, position: 'RW', rating: 89, attributes: { pace: 89, shooting: 85, passing: 85, dribbling: 89, defending: 65, physical: 78 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'fade' },
      { id: 'lon_10', name: 'Kai Havert', number: 29, position: 'ST', rating: 86, attributes: { pace: 83, shooting: 84, passing: 81, dribbling: 84, defending: 58, physical: 81 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'lon_11', name: 'Gabriel Marti', number: 11, position: 'LW', rating: 86, attributes: { pace: 93, shooting: 80, passing: 78, dribbling: 87, defending: 46, physical: 73 }, stamina: 100, skinTone: '#e0b892', hairColor: '#1c150e', hairStyle: 'fade' },
      // Bench
      { id: 'lon_12', name: 'Leandro Tross', number: 19, position: 'LW', rating: 83, attributes: { pace: 81, shooting: 83, passing: 81, dribbling: 84, defending: 44, physical: 68 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#6a4a2a', hairStyle: 'short' },
      { id: 'lon_13', name: 'Thomas Part', number: 5, position: 'CDM', rating: 83, attributes: { pace: 70, shooting: 73, passing: 82, dribbling: 80, defending: 83, physical: 84 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'lon_14', name: 'Riccardo Cala', number: 33, position: 'LB', rating: 82, attributes: { pace: 80, shooting: 58, passing: 77, dribbling: 76, defending: 82, physical: 81 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#302213', hairStyle: 'curly' },
      { id: 'lon_15', name: 'Oleks Zinchen', number: 17, position: 'LB', rating: 81, attributes: { pace: 76, shooting: 68, passing: 84, dribbling: 82, defending: 77, physical: 68 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#c49a45', hairStyle: 'short' },
      { id: 'lon_16', name: 'Neto Murar', number: 32, position: 'GK', rating: 79, attributes: { pace: 46, shooting: 18, passing: 72, dribbling: 36, defending: 80, physical: 76 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'short' }
    ]
  },
  {
    id: 'milan_champions',
    name: 'Milan Champions',
    shortName: 'MIL',
    country: 'Italy',
    primaryColor: '#B91C1C', // Red stripes
    secondaryColor: '#000000', // Black stripes
    accentColor: '#F59E0B',
    gkColor: '#E11D48',
    kitPattern: 'stripes',
    stadiumName: 'San Siro Grande',
    formation: '4-2-3-1',
    players: [
      { id: 'mil_1', name: 'Mike Maign', number: 16, position: 'GK', rating: 88, attributes: { pace: 58, shooting: 26, passing: 85, dribbling: 52, defending: 89, physical: 84 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'mil_2', name: 'Davide Calab', number: 2, position: 'RB', rating: 82, attributes: { pace: 81, shooting: 56, passing: 76, dribbling: 77, defending: 82, physical: 76 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'mil_3', name: 'Fikayo Tomor', number: 23, position: 'CB', rating: 84, attributes: { pace: 86, shooting: 40, passing: 68, dribbling: 68, defending: 85, physical: 83 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'mil_4', name: 'Matteo Gabbi', number: 46, position: 'CB', rating: 82, attributes: { pace: 74, shooting: 38, passing: 72, dribbling: 66, defending: 83, physical: 82 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#2b1d0c', hairStyle: 'short' },
      { id: 'mil_5', name: 'Theo Hernan', number: 19, position: 'LB', rating: 87, attributes: { pace: 94, shooting: 78, passing: 81, dribbling: 85, defending: 82, physical: 85 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#302213', hairStyle: 'short' },
      { id: 'mil_6', name: 'Youssouf Fof', number: 29, position: 'CDM', rating: 84, attributes: { pace: 78, shooting: 70, passing: 80, dribbling: 79, defending: 84, physical: 86 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'mil_7', name: 'Tijjani Reij', number: 14, position: 'CDM', rating: 85, attributes: { pace: 80, shooting: 78, passing: 85, dribbling: 84, defending: 78, physical: 79 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'short' },
      { id: 'mil_8', name: 'Christian Puli', number: 11, position: 'RW', rating: 86, attributes: { pace: 88, shooting: 84, passing: 81, dribbling: 87, defending: 46, physical: 68 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'mil_9', name: 'Ruben Loftus', number: 8, position: 'CAM', rating: 83, attributes: { pace: 80, shooting: 79, passing: 79, dribbling: 83, defending: 72, physical: 85 }, stamina: 100, skinTone: '#7c4c23', hairColor: '#080808', hairStyle: 'fade' },
      { id: 'mil_10', name: 'Rafael Leao', number: 10, position: 'LW', rating: 89, attributes: { pace: 95, shooting: 84, passing: 80, dribbling: 91, defending: 34, physical: 80 }, stamina: 100, skinTone: '#5c3818', hairColor: '#050505', hairStyle: 'fade' },
      { id: 'mil_11', name: 'Alvaro Morat', number: 7, position: 'ST', rating: 84, attributes: { pace: 82, shooting: 84, passing: 75, dribbling: 81, defending: 45, physical: 78 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#121212', hairStyle: 'short' },
      // Bench
      { id: 'mil_12', name: 'Tammy Abra', number: 90, position: 'ST', rating: 81, attributes: { pace: 82, shooting: 81, passing: 68, dribbling: 77, defending: 36, physical: 80 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'fade' },
      { id: 'mil_13', name: 'Samuel Chukw', number: 21, position: 'RW', rating: 81, attributes: { pace: 89, shooting: 76, passing: 75, dribbling: 85, defending: 38, physical: 66 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'mil_14', name: 'Yunus Musah', number: 80, position: 'CM', rating: 80, attributes: { pace: 83, shooting: 68, passing: 77, dribbling: 82, defending: 75, physical: 78 }, stamina: 100, skinTone: '#4a2c11', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'mil_15', name: 'Strahinja Pav', number: 31, position: 'CB', rating: 81, attributes: { pace: 78, shooting: 40, passing: 66, dribbling: 64, defending: 82, physical: 88 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#705030', hairStyle: 'short' },
      { id: 'mil_16', name: 'Marco Sport', number: 57, position: 'GK', rating: 78, attributes: { pace: 46, shooting: 18, passing: 68, dribbling: 35, defending: 79, physical: 76 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#2b1d0c', hairStyle: 'short' }
    ]
  },
  {
    id: 'tokyo_thunder',
    name: 'Tokyo Thunder',
    shortName: 'TOK',
    country: 'Japan',
    primaryColor: '#0284C7', // Sky Blue & White Hoops
    secondaryColor: '#FFFFFF',
    accentColor: '#F43F5E',
    gkColor: '#84CC16',
    kitPattern: 'hoops',
    stadiumName: 'National Stadium Tokyo',
    formation: '4-3-3',
    players: [
      { id: 'tok_1', name: 'Zion Suzuki', number: 1, position: 'GK', rating: 82, attributes: { pace: 62, shooting: 20, passing: 78, dribbling: 45, defending: 83, physical: 85 }, stamina: 100, skinTone: '#8d5524', hairColor: '#0a0a0a', hairStyle: 'short' },
      { id: 'tok_2', name: 'Yukinari Sugaw', number: 2, position: 'RB', rating: 81, attributes: { pace: 83, shooting: 66, passing: 80, dribbling: 78, defending: 78, physical: 74 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_3', name: 'Ko Itakura', number: 4, position: 'CB', rating: 83, attributes: { pace: 79, shooting: 48, passing: 77, dribbling: 72, defending: 84, physical: 82 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_4', name: 'Koki Machida', number: 16, position: 'CB', rating: 81, attributes: { pace: 76, shooting: 42, passing: 75, dribbling: 68, defending: 82, physical: 84 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_5', name: 'Hiroki Ito', number: 21, position: 'LB', rating: 82, attributes: { pace: 82, shooting: 58, passing: 78, dribbling: 74, defending: 83, physical: 81 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_6', name: 'Wataru Endo', number: 6, position: 'CDM', rating: 85, attributes: { pace: 72, shooting: 70, passing: 81, dribbling: 78, defending: 87, physical: 85 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_7', name: 'Hidemasa Mori', number: 5, position: 'CM', rating: 83, attributes: { pace: 78, shooting: 74, passing: 83, dribbling: 82, defending: 80, physical: 80 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_8', name: 'Takefusa Kubo', number: 20, position: 'RW', rating: 86, attributes: { pace: 89, shooting: 82, passing: 85, dribbling: 90, defending: 50, physical: 68 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_9', name: 'Takumi Minam', number: 8, position: 'CAM', rating: 83, attributes: { pace: 82, shooting: 82, passing: 81, dribbling: 84, defending: 54, physical: 70 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_10', name: 'Kaoru Mitoma', number: 7, position: 'LW', rating: 87, attributes: { pace: 91, shooting: 83, passing: 82, dribbling: 92, defending: 56, physical: 70 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_11', name: 'Ayase Ueda', number: 9, position: 'ST', rating: 82, attributes: { pace: 84, shooting: 83, passing: 68, dribbling: 79, defending: 40, physical: 80 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      // Bench
      { id: 'tok_12', name: 'Keito Nakam', number: 13, position: 'LW', rating: 81, attributes: { pace: 86, shooting: 81, passing: 76, dribbling: 83, defending: 44, physical: 70 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_13', name: 'Ritsu Doan', number: 10, position: 'RW', rating: 83, attributes: { pace: 84, shooting: 81, passing: 80, dribbling: 84, defending: 58, physical: 74 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_14', name: 'Reo Hatate', number: 14, position: 'CM', rating: 80, attributes: { pace: 79, shooting: 74, passing: 80, dribbling: 81, defending: 74, physical: 76 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_15', name: 'Shogo Tanig', number: 3, position: 'CB', rating: 79, attributes: { pace: 71, shooting: 40, passing: 74, dribbling: 66, defending: 81, physical: 79 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' },
      { id: 'tok_16', name: 'Keisuke Osak', number: 23, position: 'GK', rating: 77, attributes: { pace: 48, shooting: 18, passing: 66, dribbling: 34, defending: 78, physical: 76 }, stamina: 100, skinTone: '#f4d8be', hairColor: '#0f0f0f', hairStyle: 'short' }
    ]
  },
  {
    id: 'buenos_aires_fc',
    name: 'Buenos Aires FC',
    shortName: 'BUE',
    country: 'Argentina',
    primaryColor: '#0369A1', // Sky blue
    secondaryColor: '#FFFFFF', // White stripes
    accentColor: '#F59E0B',
    gkColor: '#9333EA',
    kitPattern: 'stripes',
    stadiumName: 'Estadio Monumental Plata',
    formation: '4-3-3',
    players: [
      { id: 'bue_1', name: 'Emiliano Mart', number: 23, position: 'GK', rating: 89, attributes: { pace: 54, shooting: 22, passing: 82, dribbling: 48, defending: 91, physical: 87 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#302213', hairStyle: 'short' },
      { id: 'bue_2', name: 'Nahuel Molin', number: 26, position: 'RB', rating: 83, attributes: { pace: 86, shooting: 64, passing: 78, dribbling: 80, defending: 80, physical: 76 }, stamina: 100, skinTone: '#e0b892', hairColor: '#1c150e', hairStyle: 'short' },
      { id: 'bue_3', name: 'Cristian Rome', number: 13, position: 'CB', rating: 87, attributes: { pace: 82, shooting: 46, passing: 74, dribbling: 72, defending: 89, physical: 89 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#121212', hairStyle: 'short' },
      { id: 'bue_4', name: 'Lisandro Mart', number: 25, position: 'CB', rating: 86, attributes: { pace: 80, shooting: 52, passing: 84, dribbling: 80, defending: 87, physical: 85 }, stamina: 100, skinTone: '#e0b892', hairColor: '#121212', hairStyle: 'short' },
      { id: 'bue_5', name: 'Nicolas Taglia', number: 3, position: 'LB', rating: 82, attributes: { pace: 80, shooting: 56, passing: 76, dribbling: 76, defending: 83, physical: 81 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'bue_6', name: 'Enzo Fernan', number: 24, position: 'CM', rating: 86, attributes: { pace: 75, shooting: 80, passing: 88, dribbling: 84, defending: 80, physical: 80 }, stamina: 100, skinTone: '#e0b892', hairColor: '#241a10', hairStyle: 'fade' },
      { id: 'bue_7', name: 'Alexis MacAl', number: 20, position: 'CM', rating: 87, attributes: { pace: 76, shooting: 83, passing: 87, dribbling: 85, defending: 79, physical: 79 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#703818', hairStyle: 'short' },
      { id: 'bue_8', name: 'Rodrigo De Pau', number: 7, position: 'CM', rating: 85, attributes: { pace: 78, shooting: 78, passing: 84, dribbling: 82, defending: 81, physical: 84 }, stamina: 100, skinTone: '#e8c5a4', hairColor: '#2b1d0c', hairStyle: 'short' },
      { id: 'bue_9', name: 'Lionel Messor', number: 10, position: 'RW', rating: 92, attributes: { pace: 82, shooting: 93, passing: 94, dribbling: 95, defending: 35, physical: 65 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#4a301a', hairStyle: 'short' },
      { id: 'bue_10', name: 'Julian Alva', number: 9, position: 'ST', rating: 88, attributes: { pace: 88, shooting: 87, passing: 82, dribbling: 86, defending: 62, physical: 82 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#241a10', hairStyle: 'short' },
      { id: 'bue_11', name: 'Lautaro Mart', number: 22, position: 'LW', rating: 89, attributes: { pace: 85, shooting: 89, passing: 78, dribbling: 86, defending: 48, physical: 86 }, stamina: 100, skinTone: '#e0b892', hairColor: '#121212', hairStyle: 'fade' },
      // Bench
      { id: 'bue_12', name: 'Alejandro Garn', number: 17, position: 'LW', rating: 82, attributes: { pace: 90, shooting: 79, passing: 76, dribbling: 85, defending: 38, physical: 66 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#e0c068', hairStyle: 'fade' },
      { id: 'bue_13', name: 'Giovani Lo Cel', number: 18, position: 'CM', rating: 82, attributes: { pace: 75, shooting: 76, passing: 84, dribbling: 83, defending: 72, physical: 72 }, stamina: 100, skinTone: '#ffe0cc', hairColor: '#302213', hairStyle: 'short' },
      { id: 'bue_14', name: 'Nicolas Otam', number: 19, position: 'CB', rating: 82, attributes: { pace: 64, shooting: 42, passing: 70, dribbling: 62, defending: 85, physical: 87 }, stamina: 100, skinTone: '#a06535', hairColor: '#121212', hairStyle: 'short' },
      { id: 'bue_15', name: 'Marcos Acun', number: 8, position: 'LB', rating: 81, attributes: { pace: 78, shooting: 70, passing: 78, dribbling: 79, defending: 80, physical: 82 }, stamina: 100, skinTone: '#e0b892', hairColor: '#121212', hairStyle: 'short' },
      { id: 'bue_16', name: 'Geronimo Rull', number: 1, position: 'GK', rating: 80, attributes: { pace: 50, shooting: 18, passing: 74, dribbling: 42, defending: 81, physical: 78 }, stamina: 100, skinTone: '#ffe4d0', hairColor: '#4a301a', hairStyle: 'short' }
    ]
  }
];

export const FORMATIONS_COORDINATES: Record<string, { x: number; z: number; role: string }[]> = {
  // Pitch is -52.5 to +52.5 on X (length), -34 to +34 on Z (width)
  // For home team playing from left (-X) to right (+X):
  '4-3-3': [
    { x: -48, z: 0, role: 'GK' },
    { x: -34, z: -22, role: 'LB' },
    { x: -36, z: -8, role: 'CB' },
    { x: -36, z: 8, role: 'CB' },
    { x: -34, z: 22, role: 'RB' },
    { x: -22, z: 0, role: 'CDM' },
    { x: -14, z: -14, role: 'CM' },
    { x: -14, z: 14, role: 'CM' },
    { x: -6, z: -24, role: 'LW' },
    { x: -2, z: 0, role: 'ST' },
    { x: -6, z: 24, role: 'RW' },
  ],
  '4-4-2': [
    { x: -48, z: 0, role: 'GK' },
    { x: -34, z: -22, role: 'LB' },
    { x: -36, z: -8, role: 'CB' },
    { x: -36, z: 8, role: 'CB' },
    { x: -34, z: 22, role: 'RB' },
    { x: -18, z: -24, role: 'LM' },
    { x: -18, z: -8, role: 'CM' },
    { x: -18, z: 8, role: 'CM' },
    { x: -18, z: 24, role: 'RM' },
    { x: -4, z: -8, role: 'ST' },
    { x: -4, z: 8, role: 'ST' },
  ],
  '3-5-2': [
    { x: -48, z: 0, role: 'GK' },
    { x: -36, z: -16, role: 'CB' },
    { x: -37, z: 0, role: 'CB' },
    { x: -36, z: 16, role: 'CB' },
    { x: -20, z: -25, role: 'LM' },
    { x: -22, z: -9, role: 'CM' },
    { x: -25, z: 0, role: 'CDM' },
    { x: -22, z: 9, role: 'CM' },
    { x: -20, z: 25, role: 'RM' },
    { x: -4, z: -8, role: 'ST' },
    { x: -4, z: 8, role: 'ST' },
  ],
  '4-2-3-1': [
    { x: -48, z: 0, role: 'GK' },
    { x: -34, z: -22, role: 'LB' },
    { x: -36, z: -8, role: 'CB' },
    { x: -36, z: 8, role: 'CB' },
    { x: -34, z: 22, role: 'RB' },
    { x: -24, z: -10, role: 'CDM' },
    { x: -24, z: 10, role: 'CDM' },
    { x: -12, z: -22, role: 'LAM' },
    { x: -10, z: 0, role: 'CAM' },
    { x: -12, z: 22, role: 'RAM' },
    { x: -2, z: 0, role: 'ST' },
  ]
};

export function getSavedUserTeam(): TeamData {
  try {
    const saved = localStorage.getItem('dls3d_user_team');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name && Array.isArray(parsed.players) && parsed.players.length >= 11) {
        return parsed;
      }
    }
    const custom = localStorage.getItem('dls3d_custom_club');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.name && Array.isArray(parsed.players) && parsed.players.length >= 11) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_TEAMS[0];
}

export function saveUserTeam(club: TeamData) {
  try {
    localStorage.setItem('dls3d_user_team', JSON.stringify(club));
    localStorage.setItem('dls3d_custom_club', JSON.stringify(club));
  } catch {}
}

export function getCustomClub(): TeamData | null {
  try {
    const saved = localStorage.getItem('dls3d_user_team') || localStorage.getItem('dls3d_custom_club');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function saveCustomClub(club: TeamData) {
  saveUserTeam(club);
}


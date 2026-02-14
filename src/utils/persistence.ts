import { get, set, del } from 'idb-keyval'
import type { SaveData } from '../game/types'

const SAVE_KEY = 'gtb_game_save'

export async function saveGame(data: SaveData): Promise<void> {
  await set(SAVE_KEY, data)
}

export async function loadGame(): Promise<SaveData | undefined> {
  return await get<SaveData>(SAVE_KEY)
}

export async function deleteSave(): Promise<void> {
  await del(SAVE_KEY)
}

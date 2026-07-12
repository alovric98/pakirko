import type { PaletteColor } from "./palette";
import {
  SCHEMA_VERSION,
  type AppState,
  type Group,
  type Item,
  type PackingList,
  type Theme,
} from "./types";

/* The only module that touches localStorage — swapping the backend later
   (e.g. Supabase) should change nothing outside this file. */

const STORAGE_KEY = "pakirko:v1";

export function defaultState(): AppState {
  return { schemaVersion: SCHEMA_VERSION, theme: "light", lists: [] };
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && "localStorage" in window;
}

/* Migration hook: when SCHEMA_VERSION grows, older payloads get upgraded
   here step by step. Unknown/corrupt payloads return null → fresh state. */
function migrate(raw: unknown): AppState | null {
  if (typeof raw !== "object" || raw === null) return null;
  const state = raw as Partial<AppState>;
  if (
    state.schemaVersion === SCHEMA_VERSION &&
    (state.theme === "light" || state.theme === "dark") &&
    Array.isArray(state.lists)
  ) {
    return state as AppState;
  }
  return null;
}

export function loadState(): AppState {
  if (!isBrowser()) return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return migrate(JSON.parse(raw)) ?? defaultState();
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage blocked — the app keeps working in memory.
  }
}

export function getTheme(): Theme {
  return loadState().theme;
}

export function setTheme(theme: Theme): void {
  saveState({ ...loadState(), theme });
}

export function addList(input: {
  name: string;
  emoji: string;
  color: PaletteColor;
  tripDate: string | null;
}): PackingList {
  const list: PackingList = {
    id: crypto.randomUUID(),
    name: input.name,
    emoji: input.emoji,
    color: input.color,
    tripDate: input.tripDate,
    createdAt: new Date().toISOString(),
    groups: [],
  };
  const state = loadState();
  saveState({ ...state, lists: [...state.lists, list] });
  return list;
}

export function getListById(id: string): PackingList | undefined {
  return loadState().lists.find((list) => list.id === id);
}

export function addGroup(
  listId: string,
  input: { name: string; emoji: string; color: PaletteColor },
): Group {
  const group: Group = {
    id: crypto.randomUUID(),
    name: input.name,
    emoji: input.emoji,
    color: input.color,
    items: [],
  };
  const state = loadState();
  const lists = state.lists.map((list) =>
    list.id === listId ? { ...list, groups: [...list.groups, group] } : list,
  );
  saveState({ ...state, lists });
  return group;
}

export function addItem(listId: string, groupId: string, text: string): Item {
  const item: Item = {
    id: crypto.randomUUID(),
    text,
    done: false,
    quantityEnabled: false,
    quantity: 1,
  };
  const state = loadState();
  const lists = state.lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          groups: list.groups.map((group) =>
            group.id === groupId
              ? { ...group, items: [...group.items, item] }
              : group,
          ),
        }
      : list,
  );
  saveState({ ...state, lists });
  return item;
}

export function toggleItemDone(
  listId: string,
  groupId: string,
  itemId: string,
): void {
  const state = loadState();
  const lists = state.lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          groups: list.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  items: group.items.map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item,
                  ),
                }
              : group,
          ),
        }
      : list,
  );
  saveState({ ...state, lists });
}

function updateGroupIn(
  state: AppState,
  listId: string,
  groupId: string,
  update: (group: Group) => Group,
): AppState {
  return {
    ...state,
    lists: state.lists.map((list) =>
      list.id === listId
        ? {
            ...list,
            groups: list.groups.map((group) =>
              group.id === groupId ? update(group) : group,
            ),
          }
        : list,
    ),
  };
}

function updateItemIn(
  state: AppState,
  listId: string,
  groupId: string,
  itemId: string,
  update: (item: Item) => Item,
): AppState {
  return updateGroupIn(state, listId, groupId, (group) => ({
    ...group,
    items: group.items.map((item) => (item.id === itemId ? update(item) : item)),
  }));
}

export function updateItemText(
  listId: string,
  groupId: string,
  itemId: string,
  text: string,
): void {
  saveState(
    updateItemIn(loadState(), listId, groupId, itemId, (item) => ({
      ...item,
      text,
    })),
  );
}

export function deleteItem(
  listId: string,
  groupId: string,
  itemId: string,
): void {
  saveState(
    updateGroupIn(loadState(), listId, groupId, (group) => ({
      ...group,
      items: group.items.filter((item) => item.id !== itemId),
    })),
  );
}

export function toggleItemQuantityEnabled(
  listId: string,
  groupId: string,
  itemId: string,
): void {
  saveState(
    updateItemIn(loadState(), listId, groupId, itemId, (item) => ({
      ...item,
      quantityEnabled: !item.quantityEnabled,
    })),
  );
}

export function incrementItemQuantity(
  listId: string,
  groupId: string,
  itemId: string,
): void {
  saveState(
    updateItemIn(loadState(), listId, groupId, itemId, (item) => ({
      ...item,
      quantity: item.quantity + 1,
    })),
  );
}

export function decrementItemQuantity(
  listId: string,
  groupId: string,
  itemId: string,
): void {
  saveState(
    updateItemIn(loadState(), listId, groupId, itemId, (item) => ({
      ...item,
      quantity: Math.max(1, item.quantity - 1),
    })),
  );
}

export function moveItem(
  listId: string,
  itemId: string,
  toGroupId: string,
  toIndex: number,
): void {
  const state = loadState();
  let moved: Item | undefined;
  const withoutItem = state.lists.map((list) => {
    if (list.id !== listId) return list;
    return {
      ...list,
      groups: list.groups.map((group) => {
        const idx = group.items.findIndex((item) => item.id === itemId);
        if (idx === -1) return group;
        moved = group.items[idx];
        return { ...group, items: group.items.filter((item) => item.id !== itemId) };
      }),
    };
  });
  if (!moved) return;
  const lists = withoutItem.map((list) => {
    if (list.id !== listId) return list;
    return {
      ...list,
      groups: list.groups.map((group) =>
        group.id === toGroupId
          ? {
              ...group,
              items: [
                ...group.items.slice(0, toIndex),
                moved!,
                ...group.items.slice(toIndex),
              ],
            }
          : group,
      ),
    };
  });
  saveState({ ...state, lists });
}

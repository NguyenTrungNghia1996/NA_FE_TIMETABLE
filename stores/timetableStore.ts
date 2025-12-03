import { defineStore } from "pinia";

const MAX_HISTORY = 50;

export interface TimetablePeriod {
  id?: number;
  id_chitiet?: number;
  id_don_vi?: number;
  id_tkb?: number;
  id_lop?: number;
  ten_lop?: string;
  id_mon?: number;
  ten_mon?: string;
  id_giao_vien?: number;
  ten_giao_vien?: string;
  id_phong?: number;
  ten_phong?: string;
  tiet_thu_may?: number;
  id_ca?: number;
  ngay?: number;
  tiet?: number;
  khoa?: boolean;
  isLock?: boolean;
  isRest?: boolean;
  [key: string]: unknown;
}

export interface ClassUpdatePayload {
  id_lop?: number;
  timetable: TimetablePeriod[];
  [key: string]: unknown;
}

export type TimetableUndoType = "classUpdate" | "lockPeriod" | "unlockPeriod" | string;

export interface TimetableUndoEntry<T = unknown> {
  type: TimetableUndoType;
  payload: T;
  meta?: Record<string, unknown>;
}

export interface LockPeriodUndoPayload {
  lockId: number | string;
  classId?: number;
  timetableId?: number;
  teacherId?: number;
  isTeacherView?: boolean;
}

export interface UnlockPeriodUndoPayload {
  lockId: number | string;
  classId?: number;
  timetableId?: number;
  teacherId?: number;
  isTeacherView?: boolean;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const useTimetableStore = defineStore("timetable", {
  state: () => ({
    undoStack: [] as TimetableUndoEntry[],
  }),
  getters: {
    canUndo: state => state.undoStack.length > 0,
    // Backward compatibility with previous name
    canUndoClass: state => state.undoStack.length > 0,
    lastAction: state => state.undoStack[state.undoStack.length - 1] as TimetableUndoEntry | undefined,
  },
  actions: {
    pushUndoAction(entry?: TimetableUndoEntry | null) {
      if (!entry?.type) return false;
      this.undoStack.push({
        ...entry,
        payload: clone(entry.payload),
      });
      if (this.undoStack.length > MAX_HISTORY) {
        this.undoStack.shift();
      }
      return true;
    },
    pushClassUpdate(payload?: ClassUpdatePayload | null, meta?: Record<string, unknown>) {
      if (!payload?.timetable?.length) return false;
      return this.pushUndoAction({
        type: "classUpdate",
        payload,
        meta,
      });
    },
    pushLockPeriod(payload?: LockPeriodUndoPayload | null, meta?: Record<string, unknown>) {
      if (!payload?.lockId) return false;
      return this.pushUndoAction({
        type: "lockPeriod",
        payload,
        meta,
      });
    },
    pushUnlockPeriod(payload?: UnlockPeriodUndoPayload | null, meta?: Record<string, unknown>) {
      if (!payload?.lockId) return false;
      return this.pushUndoAction({
        type: "unlockPeriod",
        payload,
        meta,
      });
    },
    popLastAction(): TimetableUndoEntry | undefined {
      return this.undoStack.pop();
    },
    clearUndoHistory() {
      this.undoStack = [];
    },
  },
});

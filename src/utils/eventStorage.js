import { database } from '../firebase';
import { ref, set, get, update } from 'firebase/database';

/**
 * イベントをFirebase Realtime Databaseに保存
 * @param {string} eventId - イベントID
 * @param {object} eventData - イベントデータ
 * @returns {Promise<void>}
 */
export const saveEvent = async (eventId, eventData) => {
    const eventRef = ref(database, `events/${eventId}`);
    await set(eventRef, {
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
};

/**
 * イベントデータをFirebaseから取得
 * @param {string} eventId - イベントID
 * @returns {Promise<object|null>}
 */
export const getEvent = async (eventId) => {
    const eventRef = ref(database, `events/${eventId}`);
    const snapshot = await get(eventRef);

    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        return null;
    }
};

/**
 * 出欠情報を更新
 * @param {string} eventId - イベントID
 * @param {object} attendanceData - 出欠データ
 * @returns {Promise<void>}
 */
export const updateAttendance = async (eventId, attendanceData) => {
    const attendanceRef = ref(database, `events/${eventId}/attendance`);

    // 既存の出欠データを取得
    const snapshot = await get(attendanceRef);
    const existingAttendance = snapshot.exists() ? snapshot.val() : [];

    // 同じ名前の出欠データがあれば更新、なければ追加
    const existingIndex = existingAttendance.findIndex(
        a => a.name === attendanceData.name
    );

    let updatedAttendance;
    if (existingIndex !== -1) {
        updatedAttendance = [...existingAttendance];
        updatedAttendance[existingIndex] = attendanceData;
    } else {
        updatedAttendance = [...existingAttendance, attendanceData];
    }

    await set(attendanceRef, updatedAttendance);

    // 更新日時も更新
    const eventRef = ref(database, `events/${eventId}`);
    await update(eventRef, {
        updatedAt: new Date().toISOString()
    });
};

/**
 * リアルタイムでイベントデータを監視
 * @param {string} eventId - イベントID
 * @param {function} callback - データ更新時のコールバック
 * @returns {function} - 監視を解除する関数
 */
export const subscribeToEvent = (eventId, callback) => {
    const eventRef = ref(database, `events/${eventId}`);
    const { onValue, off } = require('firebase/database');

    onValue(eventRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        } else {
            callback(null);
        }
    });

    // 監視を解除する関数を返す
    return () => off(eventRef);
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ja } from 'date-fns/locale/ja';
import { format } from 'date-fns';
import { saveEvent } from '../utils/eventStorage';
import './EventCreate.css';

registerLocale('ja', ja);

const EventCreate = () => {
    const navigate = useNavigate();
    const [eventName, setEventName] = useState('');
    const [memo, setMemo] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [candidateDates, setCandidateDates] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddDate = () => {
        if (!selectedDate) return;
        const formattedDate = format(selectedDate, 'M/d HH:mm');
        if (!candidateDates.includes(formattedDate)) {
            setCandidateDates([...candidateDates, formattedDate]);
        }
        setSelectedDate(null);
    };

    const handleRemoveDate = (dateToRemove) => {
        setCandidateDates(candidateDates.filter(date => date !== dateToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (candidateDates.length === 0) {
            alert('候補日程を少なくとも1つ追加してください。');
            return;
        }

        setIsSubmitting(true);
        try {
            const id = Math.random().toString(36).substr(2, 9);
            const newEvent = {
                id,
                title: eventName,
                memo,
                candidates: candidateDates,
                attendance: []
            };

            await saveEvent(id, newEvent);
            navigate(`/event/${id}`);
        } catch (error) {
            console.error('イベント作成エラー:', error);
            alert('イベントの作成に失敗しました。もう一度お試しください。');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-event-container">
            <h2>新規イベント作成</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="eventName" className="form-label">イベント名</label>
                    <input
                        type="text"
                        id="eventName"
                        className="form-input"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="理事会 / 懇親会 / その他イベント名"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="memo" className="form-label">メモ (任意)</label>
                    <textarea
                        id="memo"
                        className="form-textarea"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="イベントの詳細を入力してください..."
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">候補日程</label>
                    <div className="date-picker-wrapper">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={30}
                            dateFormat="MM/dd HH:mm"
                            locale="ja"
                            placeholderText="日時選択（複数選択可）"
                            className="form-input date-input"
                        />
                        <button type="button" onClick={handleAddDate} className="add-date-button">
                            追加
                        </button>
                    </div>
                    <span className="form-help">カレンダーから日時を選択して「追加」ボタンを押してください。</span>
                </div>

                {candidateDates.length > 0 && (
                    <div className="form-group">
                        <label className="form-label">選択済み日程</label>
                        <div className="candidates-preview">
                            {candidateDates.map((date, index) => (
                                <div key={index} className="candidate-tag">
                                    {date}
                                    <button
                                        type="button"
                                        className="remove-date-button"
                                        onClick={() => handleRemoveDate(date)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? '作成中...' : 'イベントを作成'}
                </button>
            </form>
        </div>
    );
};

export default EventCreate;

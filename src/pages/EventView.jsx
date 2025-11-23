import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { updateAttendance } from '../utils/eventStorage';
import Toast from '../components/Toast';
import './EventView.css';

const EventView = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [newStatuses, setNewStatuses] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [toastMessage, setToastMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const eventRef = ref(database, `events/${eventId}`);

        const unsubscribe = onValue(eventRef, (snapshot) => {
            if (snapshot.exists()) {
                const eventData = snapshot.val();
                setEvent(eventData);
                setNewStatuses(Array(eventData.candidates.length).fill('o'));
                setLoading(false);
            } else {
                setEvent(null);
                setLoading(false);
            }
        }, (error) => {
            console.error('データ取得エラー:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [eventId]);

    const handleStatusChange = (index, value) => {
        const updated = [...newStatuses];
        updated[index] = value;
        setNewStatuses(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!event || !newName.trim()) {
            setToastMessage('お名前を入力してください');
            return;
        }

        setIsSubmitting(true);
        try {
            const newAttendance = {
                name: newName.trim(),
                statuses: newStatuses,
                comment: newComment.trim()
            };

            await updateAttendance(eventId, newAttendance);

            setNewName('');
            setNewStatuses(Array(event.candidates.length).fill('o'));
            setNewComment('');
            setToastMessage('出欠を登録しました！');
        } catch (error) {
            console.error('出欠登録エラー:', error);
            setToastMessage('出欠の登録に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyUrl = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setToastMessage('イベントURLをコピーしました！');
        }).catch(err => {
            console.error('コピーに失敗しました:', err);
            setToastMessage('コピーに失敗しました。');
        });
    };

    const renderSymbol = (status) => {
        switch (status) {
            case 'o': return <span className="status-symbol status-o">○</span>;
            case 'x': return <span className="status-symbol status-x">×</span>;
            case 'tri': return <span className="status-symbol status-tri">△</span>;
            default: return '-';
        }
    };

    if (loading) {
        return (
            <div className="event-view-container">
                <div className="event-header">
                    <h2 className="event-title">読み込み中...</h2>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="event-view-container">
                <div className="event-header">
                    <h2 className="event-title">イベントが見つかりません</h2>
                    <p className="event-memo">このイベントは存在しないか、削除された可能性があります。</p>
                </div>
            </div>
        );
    }

    const attendance = event.attendance || [];

    return (
        <div className="event-view-container">
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage(null)}
                />
            )}
            <div className="share-section">
                <button onClick={handleCopyUrl} className="share-button">
                    📋 イベントURLをコピー
                </button>
            </div>

            <div className="event-header">
                <h2 className="event-title">{event.title}</h2>
                <div className="event-memo">{event.memo}</div>
            </div>

            <div className="attendance-section">
                <h3>出欠表</h3>
                <div className="attendance-table-wrapper">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th className="col-name">名前</th>
                                {event.candidates.map((date, i) => (
                                    <th key={i}>{date}</th>
                                ))}
                                <th className="col-comment">コメント</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.name}</td>
                                    {p.statuses.map((s, j) => (
                                        <td key={j}>{renderSymbol(s)}</td>
                                    ))}
                                    <td>{p.comment}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="input-form-section">
                    <h3>出欠を入力する</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">お名前</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                                placeholder="お名前を入力してください"
                            />
                        </div>

                        <div className="attendance-table-wrapper">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        {event.candidates.map((date, i) => (
                                            <th key={i}>{date}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {event.candidates.map((_, i) => (
                                            <td key={i}>
                                                <div className="radio-group">
                                                    <label className={`radio-label ${newStatuses[i] === 'o' ? 'selected-o' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`status-${i}`}
                                                            value="o"
                                                            checked={newStatuses[i] === 'o'}
                                                            onChange={() => handleStatusChange(i, 'o')}
                                                        /> ○
                                                    </label>
                                                    <label className={`radio-label ${newStatuses[i] === 'tri' ? 'selected-tri' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`status-${i}`}
                                                            value="tri"
                                                            checked={newStatuses[i] === 'tri'}
                                                            onChange={() => handleStatusChange(i, 'tri')}
                                                        /> △
                                                    </label>
                                                    <label className={`radio-label ${newStatuses[i] === 'x' ? 'selected-x' : ''}`}>
                                                        <input
                                                            type="radio"
                                                            name={`status-${i}`}
                                                            value="x"
                                                            checked={newStatuses[i] === 'x'}
                                                            onChange={() => handleStatusChange(i, 'x')}
                                                        /> ×
                                                    </label>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="form-group">
                            <label className="form-label">コメント</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="コメントがあれば入力してください"
                            />
                        </div>

                        <button type="submit" className="submit-button" disabled={isSubmitting}>
                            {isSubmitting ? '登録中...' : '出欠を登録する'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventView;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../authContext';

interface Props {
    streak: number;
    level: string;
}

export const UserCard: React.FC<Props> = ({ streak, level }) => {
    const { user } = useAuth();
    return (
        <div className="card user-card">
            <div className="user-info">
                <div className="avatar">{user?.displayName?.substring(0, 2).toUpperCase() || "JA"}</div>
                <div>
                    <h3>{user?.displayName}</h3>
                    <span className="badge">Poziom: {level}</span>
                </div>
            </div>
            <div className="streak-info">Aktywność: <strong>{streak} dni z rzędu 🔥</strong></div>
            <Link to="/profile" className="link-text">Twój profil &rarr;</Link>
        </div>
    );
};